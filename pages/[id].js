import React from "react";
import { gql } from "graphql-request";

import { graphcms } from "../lib/graphcmsClient";

import CustomGraphiQL from "../components/CustomGraphiQL";

const GetAllBins = gql`
  {
    bins {
      id
    }
  }
`;

const GetBinById = gql`
  query($id: ID!) {
    bin(where: { id: $id }) {
      endpoint
      initialQuery: data
      initialVariables: variables
    }
  }
`;

export async function getStaticPaths() {
  const { bins } = await graphcms.request(GetAllBins);

  return {
    paths: bins.map(({ id }) => ({ params: { id } })),
    fallback: true,
  };
}

export async function getStaticProps({ params }) {
  const { id } = params;

  const { bin } = await graphcms.request(GetBinById, { id });

  return {
    props: {
      bin,
    },
  };
}

export default function BinPage({ bin }) {
  if (!bin) return <p>No bin found.</p>;

  return <CustomGraphiQL {...bin} />;
}
