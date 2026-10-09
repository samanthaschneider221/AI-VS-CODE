'use client';

import { useEffect, useRef, useState } from 'react';

const suggestions = [
  'What does the browser do in a client-server architecture?',
  'What happens when a client sends a request?',
  'When is the final exam?',
];

export default function Home() {
  const [name, setName] = useState('');
  const [queueName, setQueueName] = useState('');
  const [session, setSession] = useState(null);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [queue, setQueue] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, busy]);

  useEffect(() => {
    async function loadQueue() {
      try {
        const response = await fetch('/api/office-hours', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'list-queue' }),
        });
        const result = await response.json();

        if (response.ok) {
          setQueue(result.queue ?? []);
        }
      } catch {
        setQueue([]);
      }
    }

    loadQueue();
  }, []);

  async function startSession(event) {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      const response = await fetch('/api/office-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', name }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      setSession(result);
    } catch (caught) {
      setError(caught.message || 'The session could not be started.');
    } finally {
      setBusy(false);
    }
  }

  async function askQuestion(value = question) {
    const text = value.trim();
    if (!session || !text || busy) return;

    setQuestion('');
    setMessages((current) => [...current, { role: 'user', content: text }]);
    setBusy(true);
    setError('');

    try {
      const response = await fetch('/api/office-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ask', sessionId: session.id, question: text }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      setMessages((current) => [
        ...current,
        { role: 'assistant', content: result.answer, source: result.source },
      ]);
    } catch (caught) {
      setError(caught.message || 'The answer could not be loaded.');
    } finally {
      setBusy(false);
    }
  }

  async function joinQueueAction(event) {
    event.preventDefault();
    const trimmedName = queueName.trim();

    if (!trimmedName) {
      setError('Enter a name to join the queue.');
      return;
    }

    try {
      const response = await fetch('/api/office-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join-queue', name: trimmedName }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      setQueue(result.queue ?? []);
      setQueueName('');
      setNotice(`${trimmedName} joined the queue.`);
      window.setTimeout(() => setNotice(''), 2500);
    } catch (caught) {
      setError(caught.message || 'The queue could not be updated.');
    }
  }

  async function advanceQueueAction() {
    try {
      const response = await fetch('/api/office-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'advance-queue' }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      setQueue(result.queue ?? []);
      setNotice(result.current ? `${result.current.name} is up next.` : 'The queue is empty.');
      window.setTimeout(() => setNotice(''), 2500);
    } catch (caught) {
      setError(caught.message || 'The queue could not be advanced.');
    }
  }

  async function removeQueueStudent(studentId) {
    try {
      const response = await fetch('/api/office-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'leave-queue', id: studentId }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      setQueue(result.queue ?? []);
    } catch (caught) {
      setError(caught.message || 'The student could not be removed from the queue.');
    }
  }

  function simulatePayment() {
    setNotice('Payment simulated. No money was charged.');
    window.setTimeout(() => setNotice(''), 3500);
  }

  function endSession() {
    setSession(null);
    setMessages([]);
    setQuestion('');
    setError('');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home" aria-label="Office Hours home">
          <span className="brand-mark">oh</span>
          <span className="brand-name">office hours<span>COURSE ASSISTANT</span></span>
        </a>

        <div className="course-label">YOUR COURSE</div>
        <div className="course-switcher">
          <span className="course-monogram">CS</span>
          <span><strong>CS 101</strong><small>Intro to Web Systems</small></span>
          <span className="switcher-arrow" aria-hidden="true">⌄</span>
        </div>

        <div className="sidebar-rule" />
        <div className="course-label materials-label">COURSE MATERIALS <span>01</span></div>
        <div className="material-row">
          <span className="document-icon" aria-hidden="true">01</span>
          <span><strong>Client-server basics</strong><small>Lecture notes · sample</small></span>
        </div>
        <div className="sidebar-note">
          <span className="note-dot" />
          <span>Demo source set<br /><strong>1 sample lecture note</strong></span>
        </div>

        <div className="sidebar-bottom">
          <div className="demo-pill"><span /> DEMO WORKSPACE</div>
          <button className="payment-button" onClick={simulatePayment} type="button">Simulated payment</button>
          <div className="queue-panel" aria-label="Student queue management">
            <h2>Queue</h2>
            <form className="queue-form" onSubmit={joinQueueAction}>
              <label className="visually-hidden" htmlFor="queue-name">Student name</label>
              <input
                id="queue-name"
                maxLength={60}
                onChange={(event) => setQueueName(event.target.value)}
                placeholder="Enter name"
                value={queueName}
              />
              <button className="join-queue-button" type="submit">Join queue</button>
            </form>
            {queue.length > 0 ? (
              <ol className="queue-list">
                {queue.map((student) => (
                  <li key={student.id}>
                    <span>#{student.position}</span>
                    <strong>{student.name}</strong>
                    <button aria-label={`Remove ${student.name} from queue`} onClick={() => removeQueueStudent(student.id)} type="button">×</button>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="queue-empty">No students waiting.</p>
            )}
            <button className="next-student-button" onClick={advanceQueueAction} type="button">Call next student</button>
          </div>
          <p>Answers use the sample material shown above.</p>
        </div>
      </aside>

      <main className="main-panel" id="home">
        <header className="topbar">
          <div className="breadcrumb"><span>CS 101</span><span className="crumb-divider">/</span> Office hours</div>
          <div className="topbar-right">
            <span className="source-status"><span /> SOURCE READY</span>
            {session ? (
              <button className="session-button" type="button" onClick={endSession}>
                <span className="avatar">{session.name.slice(0, 1).toUpperCase()}</span>
                {session.name}<span className="switcher-arrow" aria-hidden="true">⌄</span>
              </button>
            ) : <span className="demo-label">NAME-ONLY DEMO</span>}
          </div>
        </header>

        {session ? (
          <section className="conversation" aria-label="Course question conversation">
            <div className="conversation-heading">
              <div>
                <div className="eyebrow"><span className="eyebrow-line" /> OFFICE HOURS · CS 101</div>
                <h1>Let&apos;s work it out.</h1>
                <p className="conversation-subtitle">Ask about the course material. Answers are limited to the sample source.</p>
              </div>
              <span className="session-chip">SESSION · {session.name.toUpperCase()}</span>
            </div>

            <div className="message-list" aria-live="polite" aria-relevant="additions text">
              {messages.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-index">01 / ASK</span>
                  <h2>Start with a question.</h2>
                  <p>I&apos;ll look in the sample lecture note and show where an answer came from.</p>
                  <div className="suggestion-list">
                    {suggestions.map((suggestion, index) => (
                      <button
                        className="suggestion"
                        disabled={busy}
                        key={suggestion}
                        onClick={() => askQuestion(suggestion)}
                        type="button"
                      >
                        <span className="suggestion-number">0{index + 1}</span>
                        <span>{suggestion}</span>
                        <span className="suggestion-arrow" aria-hidden="true">↗</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : messages.map((message, index) => (
                <article className={`message message-${message.role}`} key={`${message.role}-${index}`}>
                  <div className="message-label">{message.role === 'user' ? session.name : 'OFFICE HOURS'}</div>
                  <div className="message-body">{message.content}</div>
                  {message.source && (
                    <div className="citation">
                      <span className="citation-mark">↳</span>
                      <span><strong>{message.source.title}</strong><small>{message.source.section}</small></span>
                      <span className="citation-tag">SAMPLE</span>
                    </div>
                  )}
                </article>
              ))}
              {busy && session && <div className="thinking" role="status"><span /> Looking through the sample notes</div>}
              <div ref={bottomRef} />
            </div>

            <div className="composer-wrap">
              {error && <p className="error-message" role="alert">{error}</p>}
              <form className="composer" onSubmit={(event) => { event.preventDefault(); askQuestion(); }}>
                <label className="visually-hidden" htmlFor="question">Ask a course question</label>
                <textarea
                  id="question"
                  maxLength={2000}
                  onChange={(event) => setQuestion(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      askQuestion();
                    }
                  }}
                  placeholder="Ask about the course material..."
                  rows={1}
                  value={question}
                />
                <div className="composer-footer">
                  <span>Answers are based on the sample note · {question.length}/2,000</span>
                  <button className="send-button" disabled={busy || !question.trim()} type="submit" aria-label="Send question">↑</button>
                </div>
              </form>
              <p className="disclaimer">Check the cited course material. This demo can only answer from its single sample note.</p>
            </div>
          </section>
        ) : (
          <section className="welcome-layout">
            <div className="welcome-copy">
              <div className="eyebrow"><span className="eyebrow-line" /> A PLACE TO GET UNSTUCK</div>
              <h1>Good questions<br />make <em>good</em> office hours.</h1>
              <p className="welcome-intro">Explore a course idea with answers grounded in the material, not the open web.</p>
              <form className="name-form" onSubmit={startSession}>
                <label htmlFor="student-name">What should we call you?</label>
                <div className="name-input-row">
                  <input
                    autoComplete="given-name"
                    id="student-name"
                    maxLength={60}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    value={name}
                  />
                  <button className="continue-button" disabled={busy || !name.trim()} type="submit">Enter office hours <span aria-hidden="true">↗</span></button>
                </div>
                {error && <p className="error-message" role="alert">{error}</p>}
                <p className="name-note">Demo access uses a name only. No university sign-in.</p>
              </form>
            </div>
            <div className="welcome-art" aria-label="Sample course material preview">
              <div className="art-index">FIELD NOTE <span>01 / 01</span></div>
              <div className="art-illustration" aria-hidden="true">
                <div className="node node-browser"><span className="node-dots">•••</span><strong>browser</strong><small>client</small></div>
                <div className="connector connector-request"><span>request · HTTP</span><i /></div>
                <div className="node node-server"><span className="server-lines"><i /><i /><i /></span><strong>server</strong><small>response</small></div>
                <div className="art-caption">A conversation between<br />two parts of the web.</div>
              </div>
              <div className="art-footer"><span>LECTURE 01</span><span>CLIENT—SERVER BASICS</span></div>
            </div>
          </section>
        )}
      </main>

      {notice && <div className="toast" role="status">{notice}</div>}
    </div>
  );
}