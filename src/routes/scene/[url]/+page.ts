import type { PageLoad } from "./$types";

export const load: PageLoad = ({ params }) => {
  return {
    url: params.url,
  };
};

export interface ScenePage {
  url: string;
}
