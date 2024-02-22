import Image from "next/image";
import { Inter } from "next/font/google";
import Dropzone from "../components/Dropzone";
import CurrentFiles from "../components/CurrentFiles";
import styled from "styled-components";
import { useEffect, useState } from "react";
import * as api from "../shared/client/api";
import { BarLoader } from "react-spinners";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [files, setFiles] = useState<Array<string>>([]);
  const [loading, setLoading] = useState(true);

  const fetchFiles = async () => {
    const res = await api.getFiles();
    setFiles(res.data.files);
    setLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <Style>
      {loading ? (
        <BarLoader />
      ) : (
        <>
          <h1>Default Folders App</h1>
          <Dropzone existingFiles={files} fetchFiles={fetchFiles}/>
          <CurrentFiles files={files} />
        </>
      )}
    </Style>
  );
}

const Style = styled.div`
  margin: auto;
  padding: 10%;
  position: absolute;
  z-index: 0;
`;
