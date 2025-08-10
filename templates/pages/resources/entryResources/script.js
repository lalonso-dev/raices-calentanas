import "./style.scss";
import pdfView from "./utils/pdfView";
import "./utils/downloadFile";

const container = document.querySelector("#pdf-viewer");
if (container) {
  const ufile = window?.ufile || "";
  if (ufile) {
    pdfView(ufile, container);
  }
  document.getElementById("zoomIn").onclick = () => container.pdfZoomIn();
  document.getElementById("zoomOut").onclick = () => container.pdfZoomOut();
  document.getElementById("zoomReset").onclick = () => container.pdfZoomReset();
}
