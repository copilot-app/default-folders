import * as fileUtils from "@/shared/client/file-utils";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { v4 as uuid } from "uuid";
import * as nodeTypes from "../shared/types/node";
import * as apiTypes from "../shared/types/api";
import Files from "./Files";
import * as api from "../shared/client/api";
import { BarLoader } from "react-spinners";
import { createPortal } from "react-dom";
import ModalContent from "../components/Modal";
import * as domTypes from "../shared/client/types/dom";
import * as domUtils from "../shared/client/dom-utils";

const texts = {
  drop: "Drop!",
  drag: "Drag your files here...",
};

const Component = (props: { existingFiles: Array<string>, fetchFiles: ()=>void }) => {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [dropzoneClass, setDropzoneClass] = useState("dropzone");
  const [dzText, setDzText] = useState(texts.drag);
  const [nodes, setNodes] = useState<Array<nodeTypes.Node>>([]);
  const [feature, setFeature] = useState<domTypes.Feature>(null);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [matchingFiles, setMatchingFiles] = useState<Array<string>>([]);

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

    const items = [...event.dataTransfer.items].map(
      (itm: globalThis.DataTransferItem) => domUtils.convertItem(feature, itm)
    );

    const droppedFilePaths: Array<string> = [];
    for (const item of items) {
      let path = item.fullPath;
      if (path.startsWith("/")) {
        path = path.slice(1);
      }
      if(item.isDirectory && !path.endsWith("/")){
        path = `${path}/`
      }
      droppedFilePaths.push(path);
    }

    const matchingFiles = props.existingFiles.filter((file) =>
      droppedFilePaths.includes(file)
    );


    if (matchingFiles.length > 0) {
      setErrorMessage(`Error, you are trying to add duplicated files:`);
      setMatchingFiles(matchingFiles);
      setShowModal(true);
      return;
    }

    const hi = await fileUtils.convertToHierarchyNodes(items);

    setNodes((prev: Array<nodeTypes.Node>) => {
      return [...prev, ...hi];
    });
  };

  const removeNode = (indexToRemove: number) => {
    setNodes((n) => {
      return n.filter((_, index) => index !== indexToRemove);
    });
  };

  const handleSubmit = async () => {
    try {
      const fileNodes: Array<nodeTypes.SignedNode> =
        fileUtils.collectFilesFromNodeHierarchy(nodes);


      // Only get signed URLs for files:
      let signedUrlsReqBody = fileNodes
        .filter((n) => n.type === "file")
        .map((n) => ({
          key: n.key,
          mime: n.mime,
        }));

      const signedUrls = await api.getSignedUrls(
        apiTypes.SignedUrlRequestBodySchema.parse(signedUrlsReqBody)
      );

      for (const fn of fileNodes) {
        if (fn.type === 'file'){
          fn.signedUrl = signedUrls[fn.key].url;
        }else{
          fn.signedUrl = "N/A"
        }
      }

      await api.uploadFilesystemEntries(fileNodes);
      props.fetchFiles()

    } catch (err) {
      throw err;
    } finally {
      setNodes([]);
      setLoading(false);
    }
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

  if (loading) {
    return (
      <Style>
        <div className="loading-container">
          <div>Loading...</div>
          <BarLoader width={140} height={8} />
        </div>
      </Style>
    );
  }

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
      {showModal &&
        createPortal(
          <ModalContent onClose={() => setShowModal(false)}>
            {errorMessage}
            <ul>
              {matchingFiles.map((f) => (
                <li key={uuid()}>{f}</li>
              ))}
            </ul>
          </ModalContent>,
          document.body
        )}
    </Style>
  );
};

const Style = styled.div`
  min-height: 200px;
  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    min-height: 300px;
    flex-direction: column;
    gap: 1rem;
    font-size: 1.4rem;
  }
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
    min-width: 300px;
    &-dragging,
    &:hover {
      min-width: 300px;
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
