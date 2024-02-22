import styled from "styled-components";
import { v4 as uuid } from "uuid";

const Component = (props: { files: string[] }) => {
  const getRootOnly = () => {
    const result = [];
    const used = {};
    for (const filepath of props.files) {
      const tokens = filepath.split("/")
      const name = tokens[0];
      if (used.hasOwnProperty(name)) {
        continue;
      }
      if (tokens.length > 1){
        result.push(`📁 ${name}`)
      }else{
        result.push(name);
      }
      Object.assign(used, { [name]: true });
    }
    return result;
  };

  const rootNames = getRootOnly();

  return (
    <Style>
      <ul>
        {rootNames.map((f) => {
          return (
            <li key={uuid()}>
              <span>{f}</span>
            </li>
          );
        })}
      </ul>
    </Style>
  );
};
export default Component;

const Style = styled.div`

`;
