import Image from "next/image";
import { Inter } from "next/font/google";
import Dropzone from '../components/Dropzone'
import styled from "styled-components";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <Style>
      <h1>Default Folders App</h1>
      <Dropzone/>
    </Style>
  );
}

const Style = styled.div`
  margin: auto;
  padding: 10%;
`
