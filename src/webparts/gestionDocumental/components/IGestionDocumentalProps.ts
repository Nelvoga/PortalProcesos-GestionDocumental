import { IWebPartContext } from "@microsoft/sp-webpart-base";

export interface IGestionDocumentalProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  context:IWebPartContext;
}
