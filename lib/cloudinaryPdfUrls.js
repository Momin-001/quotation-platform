/** Forces attachment download (inserts `fl_attachment` transformation). */
export function getDownloadUrl(fileUrl) {
    if (!fileUrl) return fileUrl;
    if (fileUrl.includes("/upload/")) {
        return fileUrl.replace("/upload/", "/upload/fl_attachment/");
    }
    return fileUrl;
}

/** Normal preview URL for opening in a new tab (strips `fl_attachment` if present). */
export function getPdfPreviewUrl(fileUrl) {
    if (!fileUrl) return fileUrl;
    if (fileUrl.includes("/upload/fl_attachment/")) {
        return fileUrl.replace("/upload/fl_attachment/", "/upload/");
    }
    return fileUrl;
}
