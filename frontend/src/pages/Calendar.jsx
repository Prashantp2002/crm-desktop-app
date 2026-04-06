import { useState, useEffect, useRef } from "react";
import "../styles/calendar.css";
import { getCalendarEvents } from "../api/calendar";

/* ─────────────────────────────────────────
   CONFIG — must match .cal-hour-cell height in your CSS
───────────────────────────────────────── */
const HOUR_HEIGHT_PX = 56;
const TOTAL_HEIGHT   = HOUR_HEIGHT_PX * 24; // 1344px

/* ─────────────────────────────────────────
   Normalisers
───────────────────────────────────────── */
const meetingToEvent = (m) => {
  const start = new Date(m.meeting_time);
  const end   = new Date(start.getTime() + 60 * 60 * 1000);
  return {
    id:        `meeting-${m.id}`,
    title:     m.title || "Meeting",
    subtitle:  m.client_name || null,
    platform:  m.platform   || null,
    type:      "meeting",
    all_day:   false,
    startDate: start,
    endDate:   end,
    color:     "#3b82f6",
    bg:        "rgba(59,130,246,0.18)",
  };
};

const PRIORITY_STYLE = {
  high:   { color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
  medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  low:    { color: "#10b981", bg: "rgba(16,185,129,0.15)" },
};

const taskToEvent = (t) => {
  const p = PRIORITY_STYLE[t.priority] || PRIORITY_STYLE.low;
  return {
    id:        `task-${t.id}`,
    title:     t.title || t.name || "Task",
    type:      "task",
    all_day:   true,
    startDate: new Date(t.due_date),
    endDate:   null,
    ...p,
  };
};

/* ─────────────────────────────────────────
   Calendar helpers
───────────────────────────────────────── */
const DAY_NAMES   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2,"0") + ":00");

const startOfWeek = (date) => {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0,0,0,0);
  return d;
};
const addDays  = (date, n) => { const d = new Date(date); d.setDate(d.getDate()+n); return d; };
const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth()    === b.getMonth()    &&
  a.getDate()     === b.getDate();

/** Convert hours + minutes → absolute px from top of grid */
const timeToPx = (h, m) => ((h * 60 + m) / (24 * 60)) * TOTAL_HEIGHT;

/* ─────────────────────────────────────────
   useNow — live clock, re-renders every minute
───────────────────────────────────────── */
const useNow = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const tick = () => setNow(new Date());
    const msToNextMin = (60 - new Date().getSeconds()) * 1000;
    const t = setTimeout(() => {
      tick();
      const iv = setInterval(tick, 60_000);
      return () => clearInterval(iv);
    }, msToNextMin);
    return () => clearTimeout(t);
  }, []);
  return now;
};

/* ─────────────────────────────────────────
   EventChip (all-day strip)
───────────────────────────────────────── */
const EventChip = ({ ev }) => (
  <div
    className="cal-chip"
    style={{ background: ev.bg, borderLeft: `3px solid ${ev.color}` }}
    title={ev.title}
  >
    <span className="cal-chip-icon">{ev.type === "task" ? "✓" : "📅"}</span>
    <span className="cal-chip-title">{ev.title}</span>
  </div>
);

/* ─────────────────────────────────────────
   WEEK VIEW
───────────────────────────────────────── */
const WeekView = ({ weekStart, events, now }) => {
  const days      = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const scrollRef = useRef();

  /* Scroll so current time is ~200px from top on mount */
  useEffect(() => {
    if (scrollRef.current) {
      const px = timeToPx(now.getHours(), now.getMinutes());
      scrollRef.current.scrollTop = Math.max(0, px - 200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nowLinePx = timeToPx(now.getHours(), now.getMinutes());
  const nowLabel  = now.toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit", hour12: false });

  return (
    <div className="cal-week-wrap">

      {/* Header */}
      <div className="cal-week-header">
        <div className="cal-gutter" />
        {days.map((d, i) => {
          const isToday = isSameDay(d, now);
          return (
            <div key={i} className={"cal-week-col-head" + (isToday ? " cal-today-head" : "")}>
              <span className="cal-head-day">{DAY_NAMES[d.getDay()]}</span>
              <span className={"cal-head-date" + (isToday ? " cal-today-circle" : "")}>{d.getDate()}</span>
            </div>
          );
        })}
      </div>

      {/* All-day row */}
      <div className="cal-allday-row">
        <div className="cal-gutter cal-gutter-sm">all-day</div>
        {days.map((d, i) => {
          const dayEvs = events.filter((e) => e.all_day && isSameDay(e.startDate, d));
          return (
            <div key={i} className="cal-allday-cell">
              {dayEvs.map((e) => <EventChip key={e.id} ev={e} />)}
            </div>
          );
        })}
      </div>

      {/* Scrollable time grid */}
      <div className="cal-week-grid" ref={scrollRef}>

        {/* Hour labels column */}
        <div className="cal-hours-col">
          {HOURS.map((h) => (
            <div key={h} className="cal-hour-label" style={{ height: HOUR_HEIGHT_PX }}>{h}</div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((d, di) => {
          const isToday   = isSameDay(d, now);
          const dayEvents = events.filter((e) => !e.all_day && isSameDay(e.startDate, d));

          return (
            <div
              key={di}
              className={"cal-day-col" + (isToday ? " cal-today-col" : "")}
              style={{ position: "relative", height: TOTAL_HEIGHT }}
            >
              {/* Hour grid lines */}
              {HOURS.map((h) => (
                <div key={h} className="cal-hour-cell" style={{ height: HOUR_HEIGHT_PX }} />
              ))}

              {/* Red time line */}
              {isToday && (
                <div
                  className="cal-now-line"
                  style={{ position: "absolute", top: nowLinePx, left: 0, right: 0, zIndex: 10 }}
                >
                  <span className="cal-now-dot" />
                  <span className="cal-now-time">{nowLabel}</span>
                </div>
              )}

              {/* Meeting blocks */}
              {dayEvents.map((ev) => {
                const topPx = timeToPx(ev.startDate.getHours(), ev.startDate.getMinutes());
                const endH  = ev.endDate ? ev.endDate.getHours()   : ev.startDate.getHours() + 1;
                const endM  = ev.endDate ? ev.endDate.getMinutes() : 0;
                const hPx   = Math.max(timeToPx(endH, endM) - topPx, HOUR_HEIGHT_PX * 0.5);

                return (
                  <div
                    key={ev.id}
                    className="cal-event-block"
                    style={{
                      position:     "absolute",
                      top:          topPx,
                      height:       hPx,
                      left:         4,
                      right:        4,
                      background:   ev.bg,
                      borderLeft:   `3px solid ${ev.color}`,
                      borderRadius: 6,
                      padding:      "3px 6px",
                      overflow:     "hidden",
                      boxSizing:    "border-box",
                      cursor:       "pointer",
                    }}
                    title={ev.title}
                  >
                    <div className="cal-event-title">
                      {ev.type === "meeting" ? "📅 " : ""}{ev.title}
                    </div>
                    {ev.subtitle && <div className="cal-event-subtitle">{ev.subtitle}</div>}
                    {ev.platform && <div className="cal-event-platform">{ev.platform}</div>}
                    {ev.endDate && (
                      <div className="cal-event-time">
                        {ev.startDate.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:false})}
                        {" – "}
                        {ev.endDate.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:false})}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   MONTH VIEW
───────────────────────────────────────── */
const MonthView = ({ year, month, events, now }) => {
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  const sd       = new Date(firstDay);
  sd.setDate(sd.getDate() - firstDay.getDay());

  const weeks = [];
  let cur = new Date(sd);
  while (cur <= lastDay || weeks.length < 6) {
    const week = [];
    for (let i = 0; i < 7; i++) { week.push(new Date(cur)); cur.setDate(cur.getDate()+1); }
    weeks.push(week);
    if (weeks.length >= 6) break;
  }

  return (
    <div className="cal-month-wrap">
      <div className="cal-month-header">
        {DAY_NAMES.map((d) => <div key={d} className="cal-month-head-cell">{d}</div>)}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="cal-month-week">
          {week.map((d, di) => {
            const inMonth = d.getMonth() === month;
            const isToday = isSameDay(d, now);
            const dayEvs  = events.filter((e) => isSameDay(e.startDate, d));
            return (
              <div key={di} className={"cal-month-cell"+(inMonth?"":" cal-month-cell-out")+(isToday?" cal-month-cell-today":"")}>
                <span className={"cal-month-date"+(isToday?" cal-today-circle":"")}>{d.getDate()}</span>
                <div className="cal-month-events">
                  {dayEvs.slice(0,3).map((e) => <EventChip key={e.id} ev={e} />)}
                  {dayEvs.length > 3 && <span className="cal-more-chip">+{dayEvs.length-3} more</span>}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────
   TIMELINE VIEW
───────────────────────────────────────── */
const TimelineView = ({ weekStart, events, now }) => {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  return (
    <div className="cal-timeline-wrap">
      <div className="cal-timeline-header">
        <div className="cal-tl-label-col">Event</div>
        {days.map((d, i) => {
          const isToday = isSameDay(d, now);
          return (
            <div key={i} className={"cal-tl-day-head"+(isToday?" cal-today-head":"")}>
              <span>{DAY_NAMES[d.getDay()]}</span>
              <span className={"cal-tl-date"+(isToday?" cal-today-circle":"")}>{d.getDate()}</span>
            </div>
          );
        })}
      </div>
      {events.map((ev) => (
        <div key={ev.id} className="cal-tl-row">
          <div className="cal-tl-label-col">
            <span className="cal-tl-dot" style={{ background: ev.color }} />
            <span className="cal-tl-type">{ev.type === "meeting" ? "📅" : "✓"}</span>
            <span className="cal-tl-title">{ev.title}</span>
          </div>
          {days.map((d, i) => (
            <div key={i} className={"cal-tl-cell"+(isSameDay(d,now)?" cal-tl-today":"")}>
              {isSameDay(ev.startDate, d) && (
                <div className="cal-tl-block" style={{ background:ev.bg, borderLeft:`3px solid ${ev.color}` }}>
                  {ev.title}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
      {events.length === 0 && <div className="cal-tl-empty">No events this week</div>}
    </div>
  );
};

/* ─────────────────────────────────────────
   MAIN
───────────────────────────────────────── */
const CalendarPage = () => {
  const now                   = useNow();
  const [view, setView]       = useState("Week");
  const [current, setCurrent] = useState(new Date());
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiLog, setApiLog]   = useState([]);

  const weekStart = startOfWeek(current);

  useEffect(() => {
    setLoading(true);
    const log = [];

    getCalendarEvents()
      .then((res) => {
        const data = Array.isArray(res) ? res : res?.data ?? [];

        const all = data.map((ev) => ({
          ...ev,
          startDate: new Date(ev.start),
          endDate:   ev.end ? new Date(ev.end) : null,
        }));

        log.push(`events: ${all.length}`);
        setApiLog(log);
        setEvents(all);
      })
      .catch((err) => {
        console.error("Calendar fetch error:", err);
        log.push(`ERROR: ${err}`);
        setApiLog(log);
      })
      .finally(() => setLoading(false));
  }, []);

  const goToday = () => setCurrent(new Date());
  const goPrev  = () => {
    const d = new Date(current);
    view === "Month" ? d.setMonth(d.getMonth()-1) : d.setDate(d.getDate()-7);
    setCurrent(d);
  };
  const goNext  = () => {
    const d = new Date(current);
    view === "Month" ? d.setMonth(d.getMonth()+1) : d.setDate(d.getDate()+7);
    setCurrent(d);
  };

  const title = view === "Month"
    ? `${MONTH_NAMES[current.getMonth()]} ${current.getFullYear()}`
    : `${MONTH_NAMES[weekStart.getMonth()]} ${weekStart.getFullYear()}`;

  return (
    <div className="cal-page">

      {/* Topbar */}
      <div className="cal-topbar">
        <div className="cal-topbar-left">
          <button className="cal-nav-btn" onClick={goPrev}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="cal-nav-btn" onClick={goNext}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button className="cal-today-btn" onClick={goToday}>Today</button>
          <h2 className="cal-title">{title}</h2>
        </div>
        <div className="cal-topbar-right">
          {["Month","Week","Timeline"].map((v) => (
            <button key={v} className={"cal-view-btn"+(view===v?" cal-view-btn-active":"")} onClick={() => setView(v)}>{v}</button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="cal-legend">
        {[
          { label:"Meetings",             color:"#3b82f6" },
          { label:"High priority task",   color:"#ef4444" },
          { label:"Medium priority task", color:"#f59e0b" },
          { label:"Low priority task",    color:"#10b981" },
        ].map(({ label, color }) => (
          <span key={label} className="cal-legend-item">
            <span className="cal-legend-dot" style={{ background: color }} />
            {label}
          </span>
        ))}
      </div>

      {/* Debug strip — remove in production */}
      <div style={{ fontSize:11, color:"#888", padding:"2px 16px", display:"flex", gap:16, flexWrap:"wrap" }}>
        {apiLog.map((l, i) => <span key={i}>• {l}</span>)}
      </div>

      {/* Body */}
      <div className="cal-body">
        {loading ? (
          <div className="cal-loading"><div className="cal-spinner" />Loading events…</div>
        ) : view === "Week" ? (
          <WeekView weekStart={weekStart} events={events} now={now} />
        ) : view === "Month" ? (
          <MonthView year={current.getFullYear()} month={current.getMonth()} events={events} now={now} />
        ) : (
          <TimelineView weekStart={weekStart} events={events} now={now} />
        )}
      </div>
    </div>
  );
};

export default CalendarPage;