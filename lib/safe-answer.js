import sanitizeHtml from 'sanitize-html';

export function sanitizeAnswer(answer) {
  const plainText = sanitizeHtml(String(answer ?? ''), {
    allowedTags: [],
    allowedAttributes: {},
  });

  return plainText.replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1');
}
