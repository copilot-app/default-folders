import * as fileUtils from "@/shared/client/file-utils";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { v4 as uuid } from "uuid";
import * as nodeTypes from "../shared/types/node";
import * as apiTypes from "../shared/types/api";
import Files from "./Files";
import * as apiServices from "../shared/client/api-services";
import { BarLoader } from "react-spinners";

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

const Component = () => {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
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
            // @ts-ignore
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
    try {
      const fileNodes: Array<nodeTypes.Node & { signedUrl?: string }> = [];
      const collectFiles = (node: nodeTypes.Node) => {
        if (node.entry.isFile) {
          fileNodes.push(node);
        } else {
          for (const child of node.children) {
            collectFiles(child);
          }
        }
      };
      for (const n of nodes) {
        collectFiles(n);
      }

      const signedUrlsReqBody = fileNodes.map((n) => ({
        key: n.key,
        mime: n.mime,
      }));

      const signedUrls = await apiServices.getSignedUrls(
        apiTypes.SignedUrlRequestBodySchema.parse(signedUrlsReqBody)
      );

      for (const fn of fileNodes) {
        fn.signedUrl = signedUrls[fn.key].url;
      }

      for (const fn of fileNodes){
        const file = await fileUtils.getFile(fn.entry)
        if (fn.signedUrl){
          await apiServices.putFileSignedUrl(fn.signedUrl, file, fn.mime)
        }
      }
    } catch (err) {
      throw err;
    } finally {
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
    </Style>
  );
};

const Style = styled.div`
  min-height: 100vh;
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
