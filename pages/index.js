import React from "react";
import Head from "next/head";
import { gql, rawRequest } from "graphql-request";
import { isUri } from "valid-url";
import throttle from "lodash.throttle";

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

const welcomeQuery = `# Welcome to GraphiQLBin!
#
# You can use this hosted GraphiQL to share queries with others.
# 
# Write your query, click "Share Query", and share your URL!
`;

export default function IndexPage() {
  const [endpoint, setEndpoint] = React.useState("");
  const [valid, setValid] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(
    throttle(() => {
      async function checkEndpoint(endpoint) {
        if (!isUri(endpoint)) return setValid(false);

        try {
          const { status } = await rawRequest(endpoint, query);

          setValid(status < 400);
        } catch (err) {
          setValid(false);
        }
      }

      checkEndpoint(endpoint);
    }, 500),
    [endpoint]
  );

  if (!submitted)
    return (
      <React.Fragment>
        <Head>
          <title>GraphQLBin &mdash; Enter a GraphQL endpoint</title>
        </Head>
        <div
          className="graphiql-container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              valid && setSubmitted(true);
            }}
            style={{ display: "flex" }}
          >
            <input
              type="url"
              id="url"
              placeholder="Enter a GraphQL endpoint to create a bin"
              value={endpoint}
              onChange={({ target: { value } }) => setEndpoint(value)}
              style={{
                width: "450px",
                padding: "8px",
                borderRadius: "3px",
                border: "1px solid #ccc",
              }}
            />
            {valid && (
              <button className="toolbar-button" type="submit">
                Open
              </button>
            )}
          </form>
        </div>
      </React.Fragment>
    );

  return (
    <React.Fragment>
      <Head>
        <title>GraphQLBin &mdash; {endpoint}</title>
      </Head>
      <CustomGraphiQL endpoint={endpoint} initialQuery={welcomeQuery} />
    </React.Fragment>
  );
}
