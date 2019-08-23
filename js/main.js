const url = '../docs/JavaScript.pdf';

//global variables
let pdfDoc = null,
  pageNum = 1,
  pageIsRendering = false,
  pageNumIsPending = null;

const scale = 1.5,
  canvas = document.querySelector('#pdf-render'),
  ctx = canvas.getContext('2d');

//Render the page needs to know the page num
const renderPage = num => {
  //allows the program to know the state of the pages
  pageIsRendering = true;

  //get the page
  pdfDoc.getPage(num).then(page => {
    const viewport = page.getViewport({ scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    const renderCtx = {
      canvasContext: ctx,
      viewport
    };
    page.render(renderCtx).promise.then(() => {
      pageIsRendering = false;

      if (pageNumIsPending !== null) {
        renderPage(pageNumIsPending);
        pageNumIsPending = null;
      }
    });
    //output current page
    document.querySelector('#page-num').textContent = num;
  });
};

//check for pages rendering
const queueRenderPage = num => {
  if (pageIsRendering) {
    pageNumIsPending = num;
  } else {
    renderPage(num);
  }
};

//show prev page
const showPrevPage = () => {
  if (pageNum <= 1) {
    //don't go below 1
    return;
  }
  pageNum--;
  queueRenderPage(pageNum);
};

//show next page
const showNextPage = () => {
  //don't go above max lenght of the pdf
  if (pageNum >= pdfDoc.numPages) {
    return;
  }
  pageNum++;
  queueRenderPage(pageNum);
};

//get Document since we included the cdn we have access to this lib
pdfjsLib
  .getDocument(url)
  .promise.then(pdfDoc_ => {
    //set the global pdfDoc to the one within this promise
    pdfDoc = pdfDoc_;
    console.log(pdfDoc);
    //display total number of pages of pdf
    document.querySelector('#page-count').textContent = pdfDoc.numPages;

    renderPage(pageNum);
  })
  .catch(err => {
    //create the div and display error
    const div = document.createElement('div');
    div.className = 'error';
    //error comes with a param called message to display
    div.appendChild(document.createTextNode(err.message));
    document.querySelector('body').insertBefore(div, canvas);

    //remove top bar when error
    document.querySelector('.top-bar').style.display = 'none';
  });

//button events for prev and next
document.querySelector('#prev-page').addEventListener('click', showPrevPage);
document.querySelector('#next-page').addEventListener('click', showNextPage);
