function extractVideoId(urlOrId) {
  if (!urlOrId) return '';
  if (!urlOrId.includes('youtube.com') && !urlOrId.includes('youtu.be'))
    return urlOrId.trim();
  const match = urlOrId.match(
    /(?:youtube\.com.*(?:\?|&)v=|youtu\.be\/)([^&\n]+)/,
  );
  return match ? match[1] : '';
}

export default extractVideoId;
