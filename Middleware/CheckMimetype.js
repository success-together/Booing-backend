const types = {
  document: (type) => {
    const arr = [
      "text/csv",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/html",
      "text/calendar",
      "text/javascript",
      "application/json",
      "application/ld+json",
      "text/javascript",
      "application/vnd.oasis.opendocument.spreadsheet",
      "application/vnd.oasis.opendocument.text",
      "application/pdf",
      "application/x-httpd-php",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/rtf",
      "application/x-sh",
      "text/plain",
      "application/xhtml+xml",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/xml",
      "application/vnd.mozilla.xul+xml",
    ];

    return arr.includes(type) || arr.find((e) => e.includes(type));
  },
  apk: (type) => type === "application/vnd.android.package-archive",
  video: (type) => type?.startsWith("video/"),
  audio: (type) => type?.startsWith("audio/"),
  image: (type) => type?.startsWith("image/"),
  download(type) {
    return (
      !this.document(type) &&
      !this.apk(type) &&
      !this.video(type) &&
      !this.audio(type) &&
      !this.image(type)
    );
  },
};

const getCategoryByType = (type) => {
  if (types['document'](type)) return 'document';
  if (types['apk'](type)) return 'apk';
  if (types['video'](type)) return 'video';
  if (types['audio'](type)) return 'audio';
  if (types['image'](type)) return 'image';
  if (types['download'](type)) return 'download';
}

module.exports = {types, getCategoryByType}