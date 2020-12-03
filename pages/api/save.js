import { gql } from "graphql-request";

import { graphcms } from "../../lib/graphcmsClient";

const query = gql`
  mutation save($endpoint: String!, $query: String, $variables: String) {
    createBin(
      data: { endpoint: $endpoint, data: $query, variables: $variables }
    ) {
      id
    }
  }
`;

export default async ({ body }, res) => {
  const { createBin } = await graphcms.request(query, body);

  res.status(201).json(createBin);
};
