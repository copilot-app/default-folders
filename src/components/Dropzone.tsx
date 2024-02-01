import styled from "styled-components";
import { v4 as uuid } from "uuid";
import { useState, useEffect, useRef } from "react";

const texts = {
  drop: "Drop!",
  drag: "Drag your files here...",
};

const Component = () => {
  const inputRef = useRef(null);
  const [dropzoneClass, setDropzoneClass] = useState("dropzone");
  const [dzText, setDzText] = useState(texts.drag);
  const [files, setFiles] = useState([]);

  const handleDefaults = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragover = (event) => {
    handleDefaults(event);
    setDzText(texts.drop);
    setDropzoneClass("dropzone dropzone-dragging");
  };

  const handleDragleave = (event) => {
    handleDefaults(event);
    setDzText(texts.drag);
    setDropzoneClass("dropzone");
  };

  const handleDrop = (event) => {
    handleDefaults(event);
    setDzText(texts.drag);
    setDropzoneClass("dropzone");
    setFiles((prev) => {
      return [...prev, ...event.dataTransfer.files];
    });
  };

  const rmFile = (idx) => {
    setFiles((prev)=>{
      return prev.splice(idx)
    })
  };

  useEffect(() => {
    console.log(inputRef);
  }, []);

  return (
    <Style>
      <div
        className={dropzoneClass}
        onDragOver={handleDragover}
        onDrop={handleDrop}
        onDragStart={handleDefaults}
        onDrag={handleDefaults}
        onDragEnter={handleDefaults}
        onDragLeave={handleDragleave}
      >
        <input ref={inputRef} className="dropzone-input" type="file" multiple />
        <span>{dzText}</span>
      </div>
      <div>
        {files.map((f, idx) => (
          <div key={uuid()} className="file-grid">
            <div>{f.name}</div>
            <div>
              <button
                onClick={() => {
                  rmFile(idx);
                }}
              >
                X
              </button>
            </div>
          </div>
        ))}
      </div>
    </Style>
  );
};

const Style = styled.div`
  .dropzone {
    color: #444;
    border: 0.2rem dashed #ddd;
    padding: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 0.25rem;
    background-color: #eee;
    text-align: center;
    transition: 0.25s background-color ease-in-out;
    cursor: pointer;
    &-dragging,
    &:hover {
      background-color: #effeef;
    }
    &-icon {
      max-width: 75px;
      display: block;
      margin: 0 auto 1.5rem;
    }
    &-input {
      display: none;
    }
  }
  .file-grid {
    display: grid;
    grid: auto-flow min-content / 1fr 10px;
    align-items: center;
    border: solid 1px;
    padding: 0.25rem;
    border-color: #aaa;
    .file {
      margin: 3px;
    }
  }
`;

export default Component;
