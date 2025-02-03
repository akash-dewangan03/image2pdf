import React, { useState } from 'react';
import { jsPDF } from "jspdf";
import { useDrag, useDrop } from 'react-dnd';
import './App.css'; 

const ItemType = 'image'; 

function App() {
  const [image, setImage] = useState([]);
  const [download, setDownload] = useState(null);
  const [view, setView] = useState(null);
  const [isComplete, setIsComplete] = useState(false);

  const handleImage = (e) => {
    const files = e.target.files;
    const images = [];
    for (let i = 0; i < files.length; i++) {
      images.push(URL.createObjectURL(files[i]));
    }
    setImage(images);
  };

  const handleConvert = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const defaultWidth = 210;

    image.forEach((img, index) => {
      const imgWidth = doc.getImageProperties(img).width;
      const imgHeight = doc.getImageProperties(img).height;
      const ratio = imgWidth / imgHeight;
      const width = defaultWidth;
      const height = width / ratio;
      doc.addImage(img, "JPEG", 0, 0, width, height);
      if (index < image.length - 1) doc.addPage();
    });

    const pdf = doc.output("dataurlstring");
    setDownload(pdf);
    setView(doc.output("bloburl"));
    setIsComplete(true);
  };

  // Handle dragging and dropping of images
  const moveImage = (fromIndex, toIndex) => {
    const updatedImages = [...image];
    const movedImage = updatedImages.splice(fromIndex, 1)[0];
    updatedImages.splice(toIndex, 0, movedImage);
    setImage(updatedImages);
  };

  const DraggableImage = ({ src, index }) => {
    const [{ isDragging }, drag] = useDrag({
      type: ItemType,
      item: { index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    return (
      <div
        ref={drag}
        className={`image-item ${isDragging ? 'dragging' : ''}`}
        style={{ opacity: isDragging ? 0.5 : 1 }}
      >
        <img src={src} alt={`Image ${index}`} />
      </div>
    );
  };

  const DroppableArea = ({ children, index }) => {
    const [, drop] = useDrop({
      accept: ItemType,
      drop: (item) => moveImage(item.index, index),
    });

    return (
      <div ref={drop} className="droppable-area">
        {children}
      </div>
    );
  };

  return (
    <div className="container">
      <div className="flex flex-col justify-center gap-4 w-9/12 mx-auto md:w-4/12">
        <h1>Image To Pdf</h1>
        <p>Convert your multiple images into a single pdf</p>
        {isComplete && (
          <p className="text-green-500">
            Total Number of pages: {image.length}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <label className="file-upload-label">
            <span>Select file</span>
            <input
              id="file"
              type="file"
              className="hidden"
              multiple
              onChange={handleImage}
              accept="image/*"
            />
          </label>
        </div>

        {image.length > 0 && (
          <div className="image-container">
            {image.map((src, index) => (
              <DroppableArea key={index} index={index}>
                <DraggableImage src={src} index={index} />
              </DroppableArea>
            ))}
          </div>
        )}

        {image.length > 0 && (
          <button
            id="convert"
            className="bg-slate-50 text-lg font-bold text-slate-900 p-2 rounded"
            onClick={handleConvert}
          >
            Convert to PDF
          </button>
        )}

        {isComplete && (
          <div id="pdfViewAndDl">
            <div className="flex flex-row items-center justify-between gap-4">
            <a
              id="view"
              className="bg-slate-50 text-lg font-bold text-slate-900 p-5 rounded-lg transition-all duration-300 ease-in-out hover:bg-slate-200 hover:scale-105"
              href={view}
              target="_blank"
              rel="noopener noreferrer"> View Pdf </a>
            <a
              id="download"
              className="bg-slate-50 text-lg font-bold text-slate-900 p-3 rounded-lg transition-all duration-300 ease-in-out hover:bg-slate-200 hover:scale-105 ml-4"
              href={download}
              download="ConvertedPdf.pdf"> Download </a>
            </div>
          </div>
        )}

        <footer className="text-center my-4 border-t-2 border-gray-300 pt-6">
          <p className="text-sm text-gray-700">
            &copy; 2025 <span className="font-semibold">XYZ.</span> All Rights Reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
