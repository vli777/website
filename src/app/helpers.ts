export function formatGoogleDriveLink(link: string): string {
  // Try matching the /d/ pattern
  let match = link.match(/\/d\/([^/]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/uc?export=download&id=${match[1]}`;
  }
  // Try matching the open?id= pattern
  match = link.match(/open\?id=([^&]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/uc?export=download&id=${match[1]}`;
  }
  // If no match, return the original link
  return link;
}
