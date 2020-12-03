import React from "react";
import { gql, rawRequest } from "graphql-request";
import { isUri } from "valid-url";

import CustomGraphiQL from "../components/CustomGraphiQL";

const query = gql`
  {
    __schema {
      queryType {
        kind
      }
    }
  }
`;

export default function IndexPage() {
  const [endpoint, setEndpoint] = React.useState("");
  const [valid, setValid] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    async function checkEndpoint(endpoint) {
      if (isUri(endpoint)) {
        try {
          const { status } = await rawRequest(endpoint, query);

          setValid(status < 400);
        } catch (err) {
          setValid(false);
        }
      }
    }

    checkEndpoint(endpoint);
  }, [endpoint]);

  if (!submitted)
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
      >
        <input
          type="url"
          id="url"
          placeholder="Your GraphQL endpoint"
          value={endpoint}
          onChange={({ target: { value } }) => setEndpoint(value)}
        />
        <button type="submit" disabled={!valid}>
          Go
        </button>
      </form>
    );

  return <CustomGraphiQL endpoint={endpoint} />;
}
