import React from "react";
import * as nodeTypes from "../shared/types/node";
import styled from "styled-components";
import { v4 as uuid } from "uuid";

function Component(props: { nodes: Array<nodeTypes.Node>, removeNode: (idx: number)=>void }) { 
  
  return (
    <Styles>
      {props.nodes.map((f, idx) => (
        <div key={uuid()} className="file-grid">
          <div>{`${f.entry?.isDirectory ? "📁 " : ""}${f?.entry.name}`}</div>
          <div>
            <button
              onClick={(e) => {
                e.preventDefault()
                props.removeNode(idx);
              }}
            >
              X
            </button>
          </div>
        </div>
      ))}
    </Styles>
  );
}

export default Component;

const Styles = styled.div`
`;
