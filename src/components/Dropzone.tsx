import styled from "styled-components";
import { v4 as uuid } from "uuid";
//import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { HTMLAttributes } from "react";

const texts = {
  drop: "Drop!",
  drag: "Drag your files here...",
};

type Feature = null | 'file-system' | 'webkit'

const URL = process?.env?.NEXT_PUBLIC_API_URL || "http://localhost:3001"

const Component = () => {
  const inputRef = useRef(null);
  const [dropzoneClass, setDropzoneClass] = useState("dropzone");
  const [dzText, setDzText] = useState(texts.drag);
  const [files, setFiles] = useState<Array<{name: string, type: string}>>([]);
  const [feature, setFeature] = useState<Feature>(null)

  const handleDefaults = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragover = (event: Event) => {
    handleDefaults(event);
    setDzText(texts.drop);
    setDropzoneClass("dropzone dropzone-dragging");
  };

  const handleDragleave = (event: Event) => {
    handleDefaults(event);
    setDzText(texts.drag);
    setDropzoneClass("dropzone");
  };

  const handleDrop = (event: CustomEvent & {dataTransfer?: DataTransfer}) => {
    handleDefaults(event);
    setDzText(texts.drag);
    setDropzoneClass("dropzone");
    const resources = [...event.dataTransfer.items].filter((item)=>{
      return item.kind === 'file'
    }).map((item) => {
      if (!feature){
        // No directory support detected
        return
      }else{
        if (feature === 'webkit'){
          return item.webkitGetAsEntry()
        }else{
          return item.getAsFileSystemHandle()
        }
      }
    })
    console.dir(resources[0])
    setFiles((prev)=>{
      return [...prev, ...resources]
    })
  };

  const rmFile = (idx: number) => {
    setFiles((prev) => {
      return prev.splice(idx);
    });
  };

  const handleSubmit = async()=>{
    console.log("Sending request for signedUrl")

    for (const f of files){
      console.log(f)
    }

    //const res = await axios({
    //  method: "POST",
    //  url: `${URL}/api/signed-url`,
    //  data: {
    //    files: files.map((f)=>({key: f.name, mime: f.type}))
    //  },
    //  headers: {
    //    "ContentType": "application/json"
    //  }
    //})

    //console.log(res)

    console.log("Sending files to S3")
  }

  useEffect(()=>{
    if (window){
      if ('getAsFileSystemHandle' in window.DataTransferItem.prototype){
        setFeature('file-system')
      }
      if ('webkitGetAsEntry' in window.DataTransferItem.prototype){
        setFeature('webkit')
      }
    }
  }, [])

  return (
    <Style>
      <div
        className={dropzoneClass}
        // @ts-ignore
        onDragOver={handleDragover}
        // @ts-ignore
        onDrop={handleDrop}
        // @ts-ignore
        onDragStart={handleDefaults}
        // @ts-ignore
        onDrag={handleDefaults}
        // @ts-ignore
        onDragEnter={handleDefaults}
        // @ts-ignore
        onDragLeave={handleDragleave}
      >
        {/* @ts-expect-error */}
        <input ref={inputRef} className="dropzone-input" type="file" multiple webkitdirectory='' mozdirectory='' directory=''/>
        <span>{dzText}</span>
      </div>
      <div>
        {files.map((f, idx) => (
          <div key={uuid()} className="file-grid">
            <div>{`${f?.isDirectory ? "📁 " : ""}${f?.name}`}</div>
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
      <button
        onClick={handleSubmit}
        className="submit-button"
      >submit</button>
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
  .submit-button{
    color: #444;
    border: solid 2px;
    border-radius: 3px;
    border-color: #4F8;
    padding: .25rem;
    text-transform: uppercase;
  }
`;

export default Component;
