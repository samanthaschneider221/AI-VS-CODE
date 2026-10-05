const source = {
  title: 'Lecture 01: Client-Server Basics',
  section: 'Requests and responses',
  content:
    'A browser commonly acts as a client. The client sends a request over HTTP; the server processes it and returns a response.',
};

const supportedTerms = new Set([
  'browser',
  'client',
  'server',
  'architecture',
  'http',
  'request',
  'requests',
  'response',
  'responses',
]);

const fallback =
  "I couldn't find that in the available course materials. Try asking about the client-server model.";

export function answerQuestion(question) {
  const terms = question.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  const isSupported = terms.some((term) => supportedTerms.has(term));

  if (!isSupported) {
    return { answer: fallback, source: null };
  }

  return {
    answer:
      'A browser commonly acts as a client. The client sends a request over HTTP; the server processes it and returns a response.',
    source: { title: source.title, section: source.section },
  };
}