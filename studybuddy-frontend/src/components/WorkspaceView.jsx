import React, { useMemo, useRef, useState } from 'react'
import A4Sheet from './A4Sheet'
import LoadingSpinner from './LoadingSpinner'

function PanelIcon({ className }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <rect x="3" y="4" width="14" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 4v12" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function SearchIcon({ className }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="8.8" cy="8.8" r="5.2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12.7 12.7 16.4 16.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function PdfIcon({ className }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M6 3.8h6.8L16 7v9.2H6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12.8 3.8V7H16" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7.7 10.3h6M7.7 12.5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function PlusIcon({ className }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M10 4.2v11.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4.2 10h11.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export default function WorkspaceView({
  workspaceName,
  activeTitle,
  activeNotes,
  onChat,
  chatMessages,
  greeting,
  documents,
  onGenerate,
  onSearchNotes,
  onUpload,
  onDeleteDocument,
  talkHistory,
  onDeleteTalk,
  onClearTalks,
}) {
  const [question, setQuestion] = useState('')
  const [chatError, setChatError] = useState('')
  const [sendingQuestion, setSendingQuestion] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState('')
  const [uploading, setUploading] = useState(false)
  const [sourceQuery, setSourceQuery] = useState('')
  const [selectedSourceIds, setSelectedSourceIds] = useState([])
  const [activeGenerateDocId, setActiveGenerateDocId] = useState(null)
  const [activeDeleteDocId, setActiveDeleteDocId] = useState(null)
  const [isSourcesCollapsed, setIsSourcesCollapsed] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [talkError, setTalkError] = useState('')
  const [activeDeleteTalkId, setActiveDeleteTalkId] = useState(null)
  const [clearingTalks, setClearingTalks] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const fileInputRef = useRef(null)

  const contextDocuments = useMemo(() => {
    const selected = documents.filter((doc) => selectedSourceIds.includes(String(doc.id)))
    return selected.length > 0 ? selected.slice(0, 4) : documents.slice(0, 4)
  }, [documents, selectedSourceIds])

  const filteredDocuments = useMemo(() => {
    const query = sourceQuery.trim().toLowerCase()
    if (!query) return documents

    return documents.filter(
      (doc) =>
        doc.filename.toLowerCase().includes(query) ||
        String(doc.summary || '').toLowerCase().includes(query)
    )
  }, [documents, sourceQuery])

  const allVisibleSelected =
    filteredDocuments.length > 0 &&
    filteredDocuments.every((doc) => selectedSourceIds.includes(String(doc.id)))

  const handleSideChat = async (e) => {
    e.preventDefault()
    if (!question.trim()) return

    setChatError('')
    setSendingQuestion(true)
    try {
      await onChat(question.trim())
      setQuestion('')
    } catch (err) {
      setChatError(err.message || 'Could not send question right now.')
    } finally {
      setSendingQuestion(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setSelectedFile(file || null)
    setUploadError('')
    setUploadSuccess('')
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Select a PDF before uploading.')
      return
    }

    setUploading(true)
    setUploadError('')
    setUploadSuccess('')

    try {
      await onUpload(selectedFile, { assignToActiveWorkspace: true })
      setUploadSuccess(selectedFile.name)
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      setUploadError(err.message || 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const handleGenerate = async (doc) => {
    setActiveGenerateDocId(doc.id)
    try {
      await onGenerate(doc)
    } finally {
      setActiveGenerateDocId(null)
    }
  }

  const handleSearchTrigger = async (searchType) => {
    const query = sourceQuery.trim()
    if (!query) {
      setDeleteError('Enter a search term first.')
      return
    }

    if (!onSearchNotes) return

    setIsSearching(true)
    setDeleteError('')
    try {
      await onSearchNotes(query, searchType)
      setSourceQuery('')
    } catch (err) {
      setDeleteError(err.message || 'Search failed.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleDeleteDocument = async (doc) => {
    if (!onDeleteDocument) return

    setDeleteError('')
    setActiveDeleteDocId(doc.id)
    try {
      await onDeleteDocument(doc)
      setSelectedSourceIds((prev) => prev.filter((id) => String(id) !== String(doc.id)))
    } catch (err) {
      setDeleteError(err.message || 'Delete failed.')
    } finally {
      setActiveDeleteDocId(null)
    }
  }

  const handleDeleteTalk = async (talkId) => {
    if (!onDeleteTalk) return

    setTalkError('')
    setActiveDeleteTalkId(talkId)
    try {
      await onDeleteTalk(talkId)
    } catch (err) {
      setTalkError(err.message || 'Could not delete talk history entry.')
    } finally {
      setActiveDeleteTalkId(null)
    }
  }

  const handleClearTalks = async () => {
    if (!onClearTalks) return

    setTalkError('')
    setClearingTalks(true)
    try {
      await onClearTalks()
    } catch (err) {
      setTalkError(err.message || 'Could not clear talk history right now.')
    } finally {
      setClearingTalks(false)
    }
  }

  const toggleSourceSelection = (sourceId) => {
    const normalizedId = String(sourceId)
    setSelectedSourceIds((prev) =>
      prev.includes(normalizedId)
        ? prev.filter((id) => id !== normalizedId)
        : [...prev, normalizedId]
    )
  }

  const toggleSelectAllVisible = () => {
    const visibleIds = filteredDocuments.map((doc) => String(doc.id))
    if (visibleIds.length === 0) return

    setSelectedSourceIds((prev) => {
      const alreadyAllSelected = visibleIds.every((id) => prev.includes(id))
      if (alreadyAllSelected) {
        return prev.filter((id) => !visibleIds.includes(id))
      }
      return Array.from(new Set([...prev, ...visibleIds]))
    })
  }

  const workspaceLabel = workspaceName || 'General'

  return (
    <div
      className="bg-[#FCFBF8] text-[#292524] h-[calc(100vh-52px)] w-full overflow-hidden flex"
    >
      {/* Left Sidebar: Sources */}
      <aside
        className="border-r border-[#E6E1DA] bg-[#FDFCFB] transition-all duration-300 flex-shrink-0 flex flex-col justify-between"
        style={{ width: isSourcesCollapsed ? '64px' : '260px' }}
      >
        <input
          id="workspace-upload-file"
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />

        {isSourcesCollapsed ? (
          <div className="h-full flex flex-col items-center py-4 gap-4 bg-[#FDFCFB]">
            <button
              type="button"
              onClick={() => setIsSourcesCollapsed(false)}
              className="h-9 w-9 rounded-lg border border-[#E6E1DA] bg-white text-stone-700 grid place-items-center hover:border-[#F97316] hover:text-[#F97316] transition-colors shadow-sm"
              title="Expand Sources"
            >
              <PanelIcon className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="h-9 w-9 rounded-lg border border-[#E6E1DA] bg-white text-stone-700 grid place-items-center hover:border-[#F97316] hover:text-[#F97316] transition-colors shadow-sm"
              title="Add source"
            >
              <PlusIcon className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              className="h-9 w-9 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white text-[10px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-bold transition-colors"
              title="Push source"
            >
              {uploading ? '...' : 'Push'}
            </button>

            <div className="mt-auto w-9 rounded-lg border border-[#E6E1DA] bg-white py-2 text-center shadow-sm">
              <p className="text-[8px] text-stone-400 uppercase tracking-wider font-bold">Src</p>
              <p className="text-xs text-stone-850 font-bold mt-0.5">{documents.length}</p>
            </div>
          </div>
        ) : (
          <div className="h-full p-4 flex flex-col gap-4 overflow-y-auto bg-[#FDFCFB]">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider">Sources Manager</h3>
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#F97316] mt-0.5 font-bold truncate max-w-[170px]">{workspaceLabel}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsSourcesCollapsed(true)}
                className="rounded-lg border border-[#E6E1DA] bg-white p-1.5 text-stone-600 hover:border-[#F97316] hover:text-[#F97316] transition-colors shadow-sm flex-shrink-0"
                title="Collapse Sources"
              >
                <PanelIcon className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-lg border border-[#E6E1DA] hover:border-[#F97316] bg-white px-4 py-2.5 text-stone-700 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#FFF7ED] transition-all shadow-sm active:scale-95"
            >
              <span className="text-sm font-bold text-[#F97316]">+</span>
              <span>Add Sources</span>
            </button>

            <div className="rounded-xl border border-[#E6E1DA] bg-[#FCFBF8] p-3 space-y-2.5 shadow-sm">
              <div className="rounded-lg border border-[#E6E1DA] bg-white px-3 py-1.5 flex items-center gap-2 shadow-inner">
                <SearchIcon className="h-3.5 w-3.5 text-stone-400" />
                <input
                  type="text"
                  value={sourceQuery}
                  onChange={(e) => setSourceQuery(e.target.value)}
                  placeholder="Search sources..."
                  className="w-full bg-transparent text-xs text-stone-850 placeholder-stone-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSearchTrigger('web')}
                  disabled={isSearching}
                  className="flex-1 rounded-md border border-[#E6E1DA] bg-white py-1 text-[10px] text-stone-700 font-bold hover:bg-[#F6F4EF] transition-all disabled:opacity-50"
                >
                  {isSearching ? '...' : 'Web'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSearchTrigger('research')}
                  disabled={isSearching}
                  className="flex-1 rounded-md border border-[#E6E1DA] bg-white py-1 text-[10px] text-stone-700 font-bold hover:bg-[#F6F4EF] transition-all disabled:opacity-50"
                >
                  {isSearching ? '...' : 'Research'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <p className="text-xs text-stone-600 font-bold">Select all sources</p>
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleSelectAllVisible}
                className="h-3.5 w-3.5 rounded border-[#E6E1DA] bg-white text-[#F97316] focus:ring-[#F97316]"
              />
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto pr-1">
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => {
                  const selected = selectedSourceIds.includes(String(doc.id))
                  return (
                    <div
                      key={doc.id}
                      className={`rounded-lg border p-3 transition-all ${
                        selected
                          ? 'bg-white border-[#F97316] shadow-sm'
                          : 'bg-white border-[#E6E1DA] hover:border-[#FDBA74]/50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 text-red-500 flex-shrink-0">
                          <PdfIcon className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-stone-850 font-bold truncate leading-tight">{doc.filename}</p>
                          <p className="text-[9px] text-stone-400 mt-0.5 font-semibold">
                            {doc.summary ? 'Indexed source' : 'Uploaded source'}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleSourceSelection(doc.id)}
                          className="mt-0.5 h-3.5 w-3.5 rounded border-[#E6E1DA] bg-white text-[#F97316] focus:ring-[#F97316] flex-shrink-0"
                        />
                      </div>

                      <div className="mt-2.5 flex justify-end gap-1.5 border-t border-[#F6F4EF] pt-2">
                        <button
                          type="button"
                          onClick={() => handleGenerate(doc)}
                          disabled={activeGenerateDocId === doc.id}
                          className="rounded-md bg-[#FCFBF8] hover:bg-[#FFF7ED] border border-[#E6E1DA] text-stone-650 hover:text-[#F97316] text-[10px] px-2 py-0.5 font-bold transition-all disabled:opacity-60"
                        >
                          {activeGenerateDocId === doc.id ? '...' : 'Use'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDocument(doc)}
                          disabled={activeDeleteDocId === doc.id}
                          className="rounded-md bg-red-50 hover:bg-red-650 border border-red-100 text-red-600 hover:text-white text-[10px] px-2 py-0.5 font-bold transition-all disabled:opacity-60"
                        >
                          {activeDeleteDocId === doc.id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="rounded-lg border border-dashed border-[#E6E1DA] bg-[#FCFBF8] px-3 py-6 text-center text-xs text-stone-400 italic">
                  No sources available.
                </p>
              )}
            </div>

            <div className="mt-auto border-t border-[#E6E1DA]/50 pt-3 space-y-2">
              {selectedFile && <p className="text-[10px] text-stone-600 truncate font-semibold">Ready: {selectedFile.name}</p>}
              {uploadError && <p className="text-red-500 text-[10px] font-bold">{uploadError}</p>}
              {uploadSuccess && <p className="text-emerald-600 text-[10px] font-bold">Uploaded: {uploadSuccess}</p>}
              {deleteError && <p className="text-red-500 text-[10px] font-bold">{deleteError}</p>}

              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading || !selectedFile}
                className="w-full rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white text-xs py-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-bold transition-all"
              >
                {uploading ? 'Pushing...' : 'Push Source'}
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main Editing Canvas - Notion-style Direct Page Layout */}
      <main
        data-workspace-center-anchor="true"
        className="relative flex-1 overflow-y-auto bg-[#FCFBF8] p-8 md:p-12 border-r border-[#E6E1DA]"
      >
        <A4Sheet title={activeTitle} notes={activeNotes} />
      </main>

      {/* Right Sidebar: AI Chat & Context */}
      <aside
        className="bg-[#FDFCFB] flex flex-col flex-shrink-0"
        style={{
          width: '320px',
          minWidth: '320px',
          height: '100%',
        }}
      >
        <div className="h-12 border-b border-[#E6E1DA] px-4 flex items-center justify-between bg-[#FDFCFB]">
          <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Sensei AI Assistant</p>
          <span className="h-2 w-2 rounded-full bg-[#F97316] shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FCFBF8]">
          {chatMessages.length === 0 ? (
            <div className="rounded-lg border border-[#E6E1DA] bg-white p-3.5 shadow-sm">
              <p className="text-[10px] uppercase tracking-wider text-[#F97316] font-bold">Sensei</p>
              <p className="text-xs text-stone-650 mt-1 leading-relaxed">{greeting || 'Ask a question and I will help you study this topic.'}</p>
            </div>
          ) : (
            chatMessages.map((message) => (
              <div
                key={message.id}
                className={`rounded-lg border p-3.5 shadow-sm ${
                  message.role === 'student'
                    ? 'bg-white border-[#E6E1DA] text-stone-850'
                    : 'bg-[#FFF7ED] border-[#FDBA74]/50 text-stone-900'
                }`}
              >
                <p className={`text-[9px] uppercase tracking-wider font-extrabold ${message.role === 'student' ? 'text-stone-400' : 'text-[#F97316]'}`}>
                  {message.role === 'student' ? 'Student' : 'Sensei'}
                </p>
                <p className="text-xs mt-1 leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
            ))
          )}

          {/* Context Files summary box */}
          <div className="rounded-lg border border-[#E6E1DA] bg-white p-3.5 shadow-sm">
            <p className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">Context Files</p>
            <div className="mt-2 space-y-2">
              {contextDocuments.length > 0 ? (
                contextDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between gap-2 border-b border-[#F6F4EF] pb-1.5 last:border-0 last:pb-0">
                    <p className="text-[11px] text-stone-700 truncate font-semibold">{doc.filename}</p>
                    <button
                      type="button"
                      onClick={() => handleGenerate(doc)}
                      disabled={activeGenerateDocId === doc.id}
                      className="text-[9px] rounded-md bg-[#FCFBF8] hover:bg-[#FFF7ED] border border-[#E6E1DA] text-stone-600 hover:text-[#F97316] px-2 py-0.5 transition-all font-bold"
                    >
                      {activeGenerateDocId === doc.id ? '...' : 'Notes'}
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-stone-400 italic text-center py-1">No documents attached</p>
              )}
            </div>
          </div>

          {/* Voice Talk History list */}
          <div className="rounded-lg border border-[#E6E1DA] bg-white p-3.5 shadow-sm">
            <div className="flex items-center justify-between gap-2 border-b border-[#F6F4EF] pb-2">
              <p className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">Talk History</p>
              <button
                type="button"
                onClick={handleClearTalks}
                disabled={clearingTalks || talkHistory.length === 0}
                className="text-[9px] rounded-md bg-[#FCFBF8] hover:bg-red-500 hover:text-white border border-[#E6E1DA] text-stone-600 px-2 py-0.5 transition-all font-semibold"
              >
                {clearingTalks ? '...' : 'Clear'}
              </button>
            </div>

            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto pr-1">
              {talkHistory.length > 0 ? (
                talkHistory.slice(0, 12).map((talk) => (
                  <div key={talk.id} className="rounded-lg border border-[#E6E1DA] bg-[#FCFBF8] p-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className={`text-[8px] uppercase tracking-wider font-extrabold px-1 py-0.2 rounded border ${talk.source === 'voice' ? 'bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]' : 'bg-stone-100 text-stone-600 border-[#E6E1DA]'}`}>
                          {talk.source === 'voice' ? 'Voice' : 'Text'}
                        </span>
                        <p className="text-xs text-stone-800 font-semibold mt-2 line-clamp-2">Q: {talk.question}</p>
                        <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">A: {talk.answer}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteTalk(talk.id)}
                        disabled={activeDeleteTalkId === talk.id}
                        className="text-[9px] rounded bg-white hover:bg-red-600 hover:text-white border border-red-150 p-1 font-bold transition-all"
                      >
                        {activeDeleteTalkId === talk.id ? '...' : '×'}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-stone-400 italic text-center py-2">No talk history</p>
              )}
            </div>

            {talkError && <p className="text-red-500 text-[10px] font-bold mt-2">{talkError}</p>}
          </div>
        </div>

        {/* Sidebar chat input box at the bottom */}
        <div className="border-t border-[#E6E1DA] p-4 bg-[#FDFCFB]">
          <form onSubmit={handleSideChat} className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask Sensei anything..."
              className="flex-1 bg-white border border-[#E6E1DA] rounded-lg px-3 py-2 text-xs text-stone-855 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#F97316] focus:border-[#F97316] shadow-sm"
            />
            <button
              type="submit"
              disabled={sendingQuestion}
              className="rounded-lg px-3.5 py-2 bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold disabled:opacity-70 transition-all flex items-center justify-center shadow-sm"
            >
              {sendingQuestion ? (
                <span className="flex items-center gap-1">
                  <LoadingSpinner />
                  Send
                </span>
              ) : (
                'Send'
              )}
            </button>
          </form>
          {chatError && <p className="text-red-500 text-[10px] font-bold mt-1.5">{chatError}</p>}
        </div>
      </aside>
    </div>
  )
}
