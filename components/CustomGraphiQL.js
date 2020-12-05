import React from "react";
import { useRouter } from "next/router";
import { buildClientSchema, getIntrospectionQuery } from "graphql";
import GraphiQLExplorer from "graphiql-explorer";
import GraphiQL from "graphiql";

import "graphiql/graphiql.css";

const introspectionQuery = getIntrospectionQuery();

export default function CustomGraphiQL({
  endpoint,
  initialQuery = "",
  initialVariables = "",
  ...props
}) {
  const [schema, setSchema] = React.useState();
  const [query, setQuery] = React.useState(initialQuery);
  const [variables, setVariables] = React.useState(initialVariables);
  const [explorerIsOpen, setExplorerIsOpen] = React.useState(true);

  const router = useRouter();

  const ref = React.useRef();

  React.useEffect(() => {
    async function fetchSchema() {
      try {
        const { data } = await fetcher({ query: introspectionQuery }, {});
        setSchema(buildClientSchema(data));
      } catch (err) {
        console.log(err);
      }
    }

    if (endpoint) {
      fetchSchema(endpoint);
    }
  }, [endpoint]);

  const fetcher = (query, { headers }) =>
    fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(query),
    })
      .then((res) => res.text())
      .then((body) => {
        try {
          return JSON.parse(body);
        } catch (e) {
          return body;
        }
      });

  const createBin = async () => {
    try {
      const { id } = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ endpoint, query, variables }),
      }).then((res) => res.json());

      router.push(id);
    } catch (err) {
      alert("We could not save your bin. Try again!");
    }
  };

  const storageKey = (endpoint, key) => `${endpoint}:${key}`;

  const getItem = (key) =>
    typeof window !== "undefined" &&
    window.localStorage.getItem(storageKey(endpoint, key));

  const setItem = (key, value) =>
    window.localStorage.setItem(storageKey(endpoint, key), value);

  const removeItem = (key) =>
    window.localStorage.removeItem(storageKey(endpoint, key));

  const handleEditQuery = (query) => setQuery(query);

  const handleEditVariables = (variables) => setVariables(variables);

  const handleToggleExplorer = () => setExplorerIsOpen(!explorerIsOpen);

  return (
    <div className="graphiql-container">
      <GraphiQLExplorer
        schema={schema}
        query={query}
        onEdit={handleEditQuery}
        onRunOperation={(operationName) =>
          ref?.current?.handleRunQuery(operationName)
        }
        explorerIsOpen={explorerIsOpen}
        onToggleExplorer={handleToggleExplorer}
      />

      <GraphiQL
        ref={ref}
        schema={schema}
        fetcher={fetcher}
        query={query}
        onEditQuery={handleEditQuery}
        variables={variables}
        onEditVariables={handleEditVariables}
        headerEditorEnabled={true}
        shouldPersistHeaders={true}
        storage={{
          getItem,
          setItem,
          removeItem,
        }}
        toolbar={{
          additionalContent: (
            <>
              <GraphiQL.Button
                onClick={handleToggleExplorer}
                label="Explorer"
                title="Toggle Explorer"
              />
              <GraphiQL.Button
                label="Share Query"
                title="Get a link to this query"
                onClick={createBin}
              />
            </>
          ),
        }}
        {...props}
      >
        <GraphiQL.Logo>GraphiQL Bin</GraphiQL.Logo>
      </GraphiQL>
    </div>
  );
}
