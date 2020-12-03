import React from "react";
import { useRouter } from "next/router";
import GraphiQL from "graphiql";

import "graphiql/graphiql.css";

export default function CustomGraphiQL({
  endpoint,
  initialQuery = "",
  initialVariables = "",
}) {
  const [query, setQuery] = React.useState(initialQuery);
  const [variables, setVariables] = React.useState(initialVariables);

  const router = useRouter();

  const fetcher = (query) =>
    fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(query),
    })
      .then((res) => res.text())
      .then((text) => {
        try {
          return JSON.parse(text);
        } catch (err) {
          console.log(err);
          return text;
        }
      })
      .catch((res) => res.text());

  const handleSave = async () => {
    try {
      const { id } = await fetch("/api/save", {
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

  return (
    <GraphiQL
      fetcher={fetcher}
      query={query}
      onEditQuery={(query) => setQuery(query)}
      variables={variables}
      onEditVariables={(variables) => setVariables(variables)}
      toolbar={{
        additionalContent: (
          <GraphiQL.Button
            label="Save and Share"
            title="Save and Share"
            onClick={handleSave}
          />
        ),
      }}
    />
  );
}
