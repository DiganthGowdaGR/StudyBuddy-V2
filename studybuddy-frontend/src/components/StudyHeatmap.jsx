import { useEffect, useState } from "react"

const WEEKS = 53 // 12 months of data
const DAYS = 7 // Mon to Sun

// Color scale based on study minutes
function getColor(minutes) {
  if (!minutes || minutes === 0) return "#EAE6DF" // warm cream empty
  if (minutes < 30) return "#FFEDD5" // very light orange (orange-100)
  if (minutes < 60) return "#FED7AA" // light orange (orange-200)
  if (minutes < 120) return "#FDBA74" // medium light orange (orange-300)
  if (minutes < 180) return "#FB923C" // orange (orange-400)
  return "#F97316" // bright orange (orange-500)
}

function getTooltip(minutes, date) {
  if (!minutes || minutes === 0) return `No study on ${date}`
  if (minutes < 60) return `${minutes}m studied on ${date}`
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hrs}h ${mins}m studied on ${date}` : `${hrs}h studied on ${date}`
}

export default function StudyHeatmap({ studentId }) {
  const [heatmapData, setHeatmapData] = useState({})
  const [tooltip, setTooltip] = useState(null)
  const [hoveredCell, setHoveredCell] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/memory/heatmap/${studentId}`)
        if (!res.ok) throw new Error("Failed to load heatmap")
        const data = await res.json()
        setHeatmapData(data.heatmap || {})
      } catch {
        setHeatmapData({})
      }
    }
    if (studentId) fetchData()
  }, [studentId])

  // Build grid — last 26 weeks
  function buildGrid() {
    const grid = []
    const today = new Date()

    // Go back to start of current week
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - WEEKS * 7 + 1)

    for (let w = 0; w < WEEKS; w += 1) {
      const week = []
      for (let d = 0; d < DAYS; d += 1) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + w * 7 + d)

        const dateStr = date.toISOString().split("T")[0]
        const minutes = heatmapData[dateStr] || 0
        const isToday = dateStr === today.toISOString().split("T")[0]
        const isFuture = date > today

        week.push({
          date: dateStr,
          minutes,
          isToday,
          isFuture,
          label: date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
        })
      }
      grid.push(week)
    }
    return grid
  }

  // Get month labels for top of grid
  function getMonthLabels() {
    const labels = []
    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - WEEKS * 7 + 1)

    let lastMonth = -1
    for (let w = 0; w < WEEKS; w += 1) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + w * 7)
      const month = date.getMonth()

      if (month !== lastMonth) {
        labels.push({
          week: w,
          label: date.toLocaleDateString("en-IN", { month: "short" }),
        })
        lastMonth = month
      } else {
        labels.push({ week: w, label: "" })
      }
    }
    return labels
  }

  const grid = buildGrid()
  const monthLabels = getMonthLabels()
  const dayLabels = ["Mon", "", "Wed", "", "Fri", "", "Sun"]

  // Calculate total stats
  const totalMinutes = Object.values(heatmapData).reduce((a, b) => a + b, 0)
  const activeDays = Object.values(heatmapData).filter((m) => m > 0).length

  // Calculate current streak
  function getStreak() {
    let streak = 0
    const today = new Date()
    for (let i = 0; i < 365; i += 1) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const key = d.toISOString().split("T")[0]
      if (heatmapData[key] > 0) {
        streak += 1
      } else if (i > 0) {
        break
      }
    }
    return streak
  }

  const streak = getStreak()

  return (
    <div
      style={{
        background: "transparent",
        position: "relative",
      }}
    >
      {/* Header Info (Stats summary / badges) */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "12px",
              color: "#78716C",
            }}
          >
            {activeDays} active days in the last 12 months
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
          }}
        >
          {/* Streak badge */}
          {streak > 0 && (
            <div
              style={{
                background: "rgba(249,115,22,0.08)",
                border: "1px solid rgba(249,115,22,0.2)",
                borderRadius: "999px",
                padding: "3px 10px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#F97316",
              }}
            >
              🔥 {streak}D STREAK
            </div>
          )}

          {/* Total hours badge */}
          <div
            style={{
              background: "rgba(249,115,22,0.05)",
              border: "1px solid rgba(249,115,22,0.15)",
              borderRadius: "999px",
              padding: "3px 10px",
              fontSize: "11px",
              fontWeight: 600,
              color: "#EA580C",
            }}
          >
            {Math.floor(totalMinutes / 60)}h total study time
          </div>
        </div>
      </div>

      {/* Month labels */}
      <div
        style={{
          display: "flex",
          marginLeft: "28px",
          marginBottom: "6px",
          gap: "3px",
        }}
      >
        {monthLabels.map((m, i) => (
          <div
            key={i}
            style={{
              width: "13px",
              fontSize: "10px",
              color: "#78716C",
              whiteSpace: "nowrap",
              overflow: "visible",
            }}
          >
            {m.label}
          </div>
        ))}
      </div>

      {/* Grid + day labels */}
      <div
        style={{
          display: "flex",
          gap: "6px",
        }}
      >
        {/* Day labels */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "3px",
            paddingTop: "0px",
          }}
        >
          {dayLabels.map((d, i) => (
            <div
              key={i}
              style={{
                height: "13px",
                fontSize: "10px",
                color: "#78716C",
                width: "22px",
                display: "flex",
                alignItems: "center",
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div
          style={{
            display: "flex",
            gap: "3px",
            overflowX: "auto",
            paddingBottom: "4px",
          }}
        >
          {grid.map((week, wi) => (
            <div
              key={wi}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "3px",
              }}
            >
              {week.map((cell, di) => (
                <div
                  key={di}
                  onMouseEnter={(e) => {
                    if (!cell.isFuture) {
                      setHoveredCell(`${wi}-${di}`)
                      setTooltip({
                        text: getTooltip(cell.minutes, cell.label),
                        x: e.clientX,
                        y: e.clientY,
                      })
                    }
                  }}
                  onMouseLeave={() => {
                    setHoveredCell(null)
                    setTooltip(null)
                  }}
                  style={{
                    width: "13px",
                    height: "13px",
                    borderRadius: "3px",
                    background: cell.isFuture ? "transparent" : getColor(cell.minutes),
                    border: cell.isToday
                      ? "1.5px solid #EA580C"
                      : cell.isFuture
                      ? "none"
                      : "1px solid rgba(0,0,0,0.02)",
                    cursor: cell.isFuture ? "default" : "pointer",
                    transition: "all 0.1s ease-in-out",
                    transform: hoveredCell === `${wi}-${di}` ? "scale(1.3)" : "scale(1)",
                    boxShadow: hoveredCell === `${wi}-${di}` ? "0 0 6px rgba(249,115,22,0.4)" : "none",
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginTop: "12px",
          justifyContent: "flex-end",
        }}
      >
        <span style={{ fontSize: "11px", color: "#78716C" }}>Less</span>
        {["#EAE6DF", "#FFEDD5", "#FED7AA", "#FDBA74", "#FB923C", "#F97316"].map((c, i) => (
          <div
            key={i}
            style={{
              width: "13px",
              height: "13px",
              borderRadius: "3px",
              background: c,
              border: "1px solid rgba(0,0,0,0.03)",
            }}
          />
        ))}
        <span style={{ fontSize: "11px", color: "#78716C" }}>More</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: "fixed",
            left: tooltip.x + 12,
            top: tooltip.y - 40,
            background: "#FCFBF8",
            border: "1px solid #E6E1DA",
            borderRadius: "8px",
            padding: "6px 12px",
            fontSize: "12px",
            color: "#1C1917",
            pointerEvents: "none",
            zIndex: 9999,
            whiteSpace: "nowrap",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  )
}
