export function formatGoogleDriveLink(link: string): string {
  // Try matching the /d/ pattern
  let match = link.match(/\/d\/([^/]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/uc?id=${match[1]}&export=download`;
  }
  // Try matching the open?id= pattern
  match = link.match(/open\?id=([^&]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/uc?id=${match[1]}&export=download`;
  }
  // If no match, return the original link
  return link;
}
