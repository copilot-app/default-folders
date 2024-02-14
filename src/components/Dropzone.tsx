import * as fileUtils from "@/shared/client/file-utils";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { v4 as uuid } from "uuid";
import * as nodeTypes from "../shared/types/node";
import Files from "./Files";
import * as apiServices from "../shared/client/api-services";

const texts = {
  drop: "Drop!",
  drag: "Drag your files here...",
};

type Feature = null | "file-system" | "webkit";
type DataTransferItem = {
  name: string;
  isDirectory: boolean;
  isFile: boolean;
};

const URL = process?.env?.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const Component = () => {
  const inputRef = useRef(null);
  const [dropzoneClass, setDropzoneClass] = useState("dropzone");
  const [dzText, setDzText] = useState(texts.drag);
  const [files, setFiles] = useState<Array<DataTransferItem>>([]);
  const [nodes, setNodes] = useState<Array<nodeTypes.Node>>([]);
  const [feature, setFeature] = useState<Feature>(null);

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

  const handleDrop = async (
    event: CustomEvent & { dataTransfer: DataTransfer }
  ) => {
    handleDefaults(event);
    setDzText(texts.drag);
    setDropzoneClass("dropzone");
    // @ts-ignore
    const resources = [...event?.dataTransfer?.items]
      .filter((item) => {
        return item.kind === "file";
      })
      .map((item) => {
        if (!feature) {
          // No directory support detected
          return;
        } else {
          if (feature === "webkit") {
            return item.webkitGetAsEntry();
          } else {
            return item.getAsFileSystemHandle();
          }
        }
      });

    const n: Array<nodeTypes.Node> = [];
    for (const r of resources) {
      n.push(await fileUtils.getFileStructure(r));
    }
    setNodes((prev: Array<nodeTypes.Node>) => {
      return [...prev, ...n];
    });
  };

  const removeNode = (indexToRemove: number) => {
    setNodes((n) => {
      return n.filter((_, index) => index !== indexToRemove);
    });
  };

  const handleSubmit = async () => {
    const mapFilesToMime: Array<{
      mime: string;
      key: string;
      resource: object;
      uploadConfig?: {
        key: string;
        url: string;
      };
    }> = [];

    for (let i = 0; i < files.length; i++) {
      const mime: string = await fileUtils.getFileMetadata(files[i]);
      const key: string = files[i].name;

      mapFilesToMime.push({
        resource: files[i],
        mime,
        key,
      });
    }

    console.log(mapFilesToMime);

    //const mapSignedUrls = await apiServices.getSignedUrls(mapFilesToMime)

    //for (const entry of mapFilesToMime) {
    //  entry.uploadConfig = mapSignedUrls[entry.key];
    //  if (!entry.uploadConfig) {
    //    continue;
    //  }

    //  const url = entry.uploadConfig.url
    //  const file = await fileUtils.getFile(entry.resource)
    //  const mimeType = entry.mime

    //  const uploadResp = await axios.put(url, file, {
    //    headers: {
    //      'Content-Type': mimeType
    //    }
    //  })
    //  console.log(uploadResp)
    //}
  };

  useEffect(() => {
    if (window) {
      if ("getAsFileSystemHandle" in window.DataTransferItem.prototype) {
        setFeature("file-system");
      }
      if ("webkitGetAsEntry" in window.DataTransferItem.prototype) {
        setFeature("webkit");
      }
    }
  }, []);

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
        <input
          ref={inputRef}
          className="dropzone-input"
          type="file"
          multiple
          webkitdirectory=""
          mozdirectory=""
          directory=""
        />
        <span>{dzText}</span>
      </div>
      <div>
        <Files nodes={nodes} removeNode={removeNode} />
      </div>
      <button onClick={handleSubmit} className="submit-button">
        submit
      </button>
      {nodes.map((n) => n.entry.name)}
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
  .submit-button {
    color: #444;
    border: solid 2px;
    border-radius: 3px;
    border-color: #4f8;
    padding: 0.25rem;
    text-transform: uppercase;
  }
`;

export default Component;
