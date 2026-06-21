import React, { useMemo, useRef, useState } from 'react'
import LoadingSpinner from './LoadingSpinner'
import ProgressRing from './ProgressRing'

const FILTERS = [
  { id: 'all', label: 'All Files' },
  { id: 'pdf', label: 'PDFs' },
  { id: 'doc', label: 'Docs' },
  { id: 'sheet', label: 'Spreadsheets' },
  { id: 'recording', label: 'Recordings' },
]

function getFileType(filename = '') {
  const extension = filename.split('.').pop()?.toLowerCase()

  if (extension === 'pdf') return 'pdf'
  if (['doc', 'docx', 'txt', 'md', 'rtf'].includes(extension)) return 'doc'
  if (['xls', 'xlsx', 'csv'].includes(extension)) return 'sheet'
  if (['mp3', 'wav', 'm4a', 'ogg'].includes(extension)) return 'recording'
  return 'other'
}

function getSubjectFromFilename(filename = '') {
  const plain = filename.replace(/\.[^/.]+$/, '')
  const parts = plain.split(/[-_\s]+/).filter(Boolean)
  if (parts.length === 0) return 'General'
  return parts.slice(0, 2).join(' ')
}

function formatRelativeTime(value) {
  if (!value) return 'Time unavailable'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Time unavailable'

  const diffMs = date.getTime() - Date.now()
  const absMs = Math.abs(diffMs)
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  if (absMs < hour) return formatter.format(Math.round(diffMs / minute), 'minute')
  if (absMs < day) return formatter.format(Math.round(diffMs / hour), 'hour')
  return formatter.format(Math.round(diffMs / day), 'day')
}

function summarize(text = '') {
  if (!text) return 'No summary yet. Generate notes to create context.'
  const cleaned = text
    .replace(/[#>*`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return cleaned.length > 120 ? `${cleaned.slice(0, 120)}...` : cleaned
}

export default function LibraryView({ documents, onUpload, onGenerate, onOpenWorkspace, onDeleteDocument }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState('')
  const [activeGenerateId, setActiveGenerateId] = useState(null)
  const [activeDeleteId, setActiveDeleteId] = useState(null)
  const [generateError, setGenerateError] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const fileInputRef = useRef(null)

  const resourceLimit = Number(import.meta.env.VITE_RESOURCE_LIMIT || 100)

  const subjects = useMemo(() => {
    const map = new Map()
    documents.forEach((doc) => {
      const subject = getSubjectFromFilename(doc.filename)
      map.set(subject, (map.get(subject) || 0) + 1)
    })
    return Array.from(map.entries())
  }, [documents])

  const filteredDocuments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return documents.filter((doc) => {
      const fileType = getFileType(doc.filename)
      const typeMatches = activeFilter === 'all' || fileType === activeFilter
      const queryMatches =
        query.length === 0 ||
        doc.filename.toLowerCase().includes(query) ||
        (doc.summary || '').toLowerCase().includes(query)

      return typeMatches && queryMatches
    })
  }, [documents, activeFilter, searchQuery])

  const usagePercent = Math.min(100, Math.round((documents.length / resourceLimit) * 100))

  const handleSelectUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadError('')
    setUploadSuccess('')
    setGenerateError('')
    setDeleteError('')
    setUploading(true)

    try {
      await onUpload(file)
      setUploadSuccess(file.name)
    } catch (err) {
      setUploadError(err.message || 'Upload failed.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleGenerate = async (doc) => {
    setGenerateError('')
    setDeleteError('')
    setActiveGenerateId(doc.id)
    try {
      await onGenerate(doc)
      onOpenWorkspace()
    } catch (err) {
      setGenerateError(err.message || 'Could not generate notes.')
    } finally {
      setActiveGenerateId(null)
    }
  }

  const handleDelete = async (doc) => {
    if (!onDeleteDocument) return

    setGenerateError('')
    setDeleteError('')
    setActiveDeleteId(doc.id)
    try {
      await onDeleteDocument(doc)
    } catch (err) {
      setDeleteError(err.message || 'Could not delete resource.')
    } finally {
      setActiveDeleteId(null)
    }
  }

  return (
    <div className="h-full flex bg-transparent text-[#292524]">
      <aside className="w-64 border-r border-[#E6E1DA] bg-[#F6F4EF] p-4 flex flex-col gap-4">
        <div className="sb-card bg-white border-[#E6E1DA]">
          <p className="sb-eyebrow text-[#78716C]">Core Subjects</p>
          <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
            {subjects.length > 0 ? (
              subjects.map(([subject, count]) => (
                <div key={subject} className="rounded-lg border border-[#E6E1DA] bg-[#FCFBF8] px-3 py-2 flex items-center justify-between">
                  <span className="text-xs text-[#1C1917] truncate pr-2">{subject}</span>
                  <span className="text-[10px] text-[#F97316] font-semibold">{count}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#4B5563] text-center py-2">No subjects yet</p>
            )}
          </div>
        </div>

        <div className="sb-card bg-white border-[#E6E1DA] space-y-2">
          <p className="sb-eyebrow text-[#78716C]">Collections</p>
          <div className="space-y-2 text-xs text-[#292524]">
            <div className="rounded-lg border border-[#E6E1DA] bg-[#FCFBF8] px-3 py-2 flex items-center justify-between">
              <span>All Resources</span>
              <span className="text-[#F97316] font-semibold">{documents.length}</span>
            </div>
            <div className="rounded-lg border border-[#E6E1DA] bg-[#FCFBF8] px-3 py-2 flex items-center justify-between">
              <span>Needs Notes</span>
              <span className="text-[#F97316] font-semibold">{documents.filter((doc) => !doc.summary).length}</span>
            </div>
          </div>
        </div>

        <div className="sb-card bg-white border-[#E6E1DA] mt-auto">
          <p className="sb-eyebrow text-[#78716C]">Storage Status</p>
          <div className="mt-3 flex items-center gap-3">
            <ProgressRing
              value={usagePercent}
              size={72}
              stroke={7}
              progressClass="stroke-[#F97316]"
              trackClass="stroke-[#E6E1DA]"
              label="used"
            />
            <div>
              <p className="text-sm text-[#1C1917] font-semibold">{documents.length} resources</p>
              <p className="text-[11px] text-[#78716C]">Limit: {resourceLimit}</p>
            </div>
          </div>
          {uploading && <p className="text-xs text-[#F97316] mt-1">Uploading resource...</p>}
          {uploadError && <p className="text-red-500 text-xs mt-1">{uploadError}</p>}
          {uploadSuccess && <p className="text-emerald-600 text-xs mt-1">Uploaded: {uploadSuccess}</p>}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1C1917]">Mission Archives</h2>
            <p className="text-sm text-[#4B5563] mt-1">Secure storage for all your academic resources.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveFilter('all')
                setSearchQuery('')
              }}
              className="sb-btn-secondary text-sm px-4 py-2"
            >
              Reset
            </button>

            <input
              type="file"
              ref={fileInputRef}
              accept="application/pdf"
              className="hidden"
              onChange={handleSelectUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="sb-btn-primary text-sm px-4 py-2"
            >
              New Resource
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all border ${
                activeFilter === filter.id
                  ? 'border-[#F97316] bg-[#FFF7ED] text-[#F97316] shadow-[0_4px_14px_rgba(249,115,22,0.1)]'
                  : 'border-[#E6E1DA] bg-white text-[#78716C] hover:text-[#1C1917] hover:border-[#F97316]/40'
              }`}
            >
              {filter.label}
            </button>
          ))}

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mission archives..."
            className="ml-auto max-w-72 w-full sb-input"
          />
        </div>

        {generateError && <p className="text-red-400 text-xs mt-2">{generateError}</p>}
        {deleteError && <p className="text-red-400 text-xs mt-2">{deleteError}</p>}

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredDocuments.length > 0 ? (
            filteredDocuments.map((doc) => {
              const type = getFileType(doc.filename)
              const subject = getSubjectFromFilename(doc.filename)

              return (
                <article key={doc.id} className="sb-card bg-white border-[#E6E1DA] flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="sb-badge" style={{ background: 'rgba(249,115,22,0.1)', color: '#F97316', borderColor: 'rgba(249,115,22,0.2)' }}>{type}</span>
                    <span className="text-[#78716C] text-xs">{formatRelativeTime(doc.upload_time)}</span>
                  </div>

                  <h3 className="mt-3 text-lg font-semibold text-[#1C1917] leading-snug break-words">{doc.filename}</h3>
                  <p className="mt-2 text-sm text-[#78716C] leading-relaxed">{summarize(doc.summary)}</p>

                  <div className="mt-4 flex items-center justify-between gap-2">
                    <span className="sb-badge" style={{ background: 'rgba(148,163,184,0.12)', color: '#CBD5E1', borderColor: 'rgba(148,163,184,0.3)' }}>{subject}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleGenerate(doc)}
                        disabled={activeGenerateId === doc.id}
                        className="sb-btn-secondary text-xs px-3 py-2 disabled:opacity-60"
                      >
                        {activeGenerateId === doc.id ? (
                          <span className="inline-flex items-center gap-1">
                            <LoadingSpinner className="w-3.5 h-3.5" />
                            Notes
                          </span>
                        ) : (
                          'Generate Notes'
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(doc)}
                        disabled={activeDeleteId === doc.id}
                        className="rounded-lg border border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.12)] text-[11px] text-[#FCA5A5] px-3 py-2 transition-all hover:border-[rgba(239,68,68,0.6)] hover:bg-[rgba(239,68,68,0.18)] disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {activeDeleteId === doc.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </article>
              )
            })
          ) : (
            <div className="col-span-full rounded-2xl border border-dashed border-[#E6E1DA] bg-[#F6F4EF] p-8 text-center">
              <p className="text-[#78716C]">No resources found for this filter.</p>
              <p className="text-[#A8A29E] text-sm mt-1">Upload a PDF to start your archive.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
