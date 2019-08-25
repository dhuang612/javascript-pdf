var url = './react.pdf';
//this is the starting point for viewing the pdf
var pageNum = 1,
  pageRendering = false,
  pageNumPending = null;
//async download pdf
var loadingTask = pdfjsLib.getDocument(url).promise.then(pdf => {
  console.log(pdf);
  console.log(pdf.numPages);
  //pdf.numPages = the total number of pages within a pdf. useful for nav
  //fetch first page
  var renderPage = num => {
    pageRendering = true;

    pdf.getPage(num).then(page => {
      var scale = 1.5;
      var viewport = page.getViewport({ scale });

      //prepare canvas for using pdf page dimensions
      var canvas = document.getElementById('my_canvas');
      var context = canvas.getContext('2d');
      var span = (document.getElementById('totalpages').textContent =
        'total pages: ' + pdf.numPages);

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      //render pdf page onto canvas context
      var renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      //check to see if the current page is done rendering
      var renderTask = page.render(renderContext);
      renderTask.promise.then(() => {
        pageRendering = false;
        if (pageNumPending !== null) {
          //new page rendering is pending
          renderPage(pageNumPending);

          //reset global var to be null;
          pageNumPending = null;
        }
      });
    });
    document.getElementById('currentpage').textContent = 'current page ' + num;
  };

  //if another page rendering is in progress wait for that to finish
  var queueRenderPage = num => {
    if (pageRendering) {
      pageNumPending = num;
    } else {
      renderPage(num);
    }
  };

  var previousPage = () => {
    if (pageNum <= 1) {
      //we are on the first page and can't go any lower
      return;
    }
    pageNum--;
    queueRenderPage(pageNum);
  };

  var nextPage = () => {
    if (pageNum >= pdf.numPages) {
      return;
    } else {
      pageNum++;
      queueRenderPage(pageNum);
    }
  };

  document.getElementById('prev').addEventListener('click', previousPage);
  document.getElementById('next').addEventListener('click', nextPage);

  //this sets the pdf to render the first page along with the information
  renderPage(pageNum);
});
