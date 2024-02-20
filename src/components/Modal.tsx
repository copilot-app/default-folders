import {ReactNode} from 'react';
import styled from 'styled-components'

const Component = (props:{ onClose: ()=>void, children: ReactNode }) => {
  return (
    <Style>
      <div className="modal">
        <div>
          {props.children}
        </div>
        <button onClick={props.onClose}>Close</button>
      </div>
    </Style>
  );
}

export default Component

const Style = styled.div`
  height: 100vh;
  min-width: 100%;
  background: #222222AA;
  position: fixed;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  .modal {
    min-width: 300px;
    min-height: 200px;
    background: #FFF;
    border-radius: 3px;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  button {
    border-bottom: 2px solid #AAA;
    padding: .2rem .6rem;
  }
`
