import { useSearchParams, Link, useParams } from "react-router-dom";
import { useState } from "react";
import { Buffer } from "buffer";

import { FullFlow } from "../types";

import ReactDiffViewer from "react-diff-viewer";
import { RadioGroup } from "../components/RadioGroup";

import { hexy } from "hexy";

import { FIRST_DIFF_KEY, SECOND_DIFF_KEY } from "../const";
import { useGetFlowQuery } from "../api";

// react-diff-viewer defaults to green/red for added/removed lines, which
// clashes with the rest of the blue-scale theme. Override it here with two
// distinguishable blue-family tones (sky = removed, indigo = added) so the
// diff view fits the same palette as the rest of the app.
const diffViewerStyles = {
  variables: {
    dark: {
      diffViewerBackground: "#171717", // neutral-900
      diffViewerColor: "#f5f5f5", // neutral-100
      addedBackground: "#1e2b6b",
      addedColor: "#c7d2fe", // indigo-200
      removedBackground: "#0c3a52",
      removedColor: "#bae6fd", // sky-200
      wordAddedBackground: "#3730a3", // indigo-800
      wordRemovedBackground: "#075985", // sky-800
      addedGutterBackground: "#1e2b6b",
      removedGutterBackground: "#0c3a52",
      gutterBackground: "#262626", // neutral-800
      gutterBackgroundDark: "#262626",
      highlightBackground: "#1e40af", // blue-800
      highlightGutterBackground: "#1e3a8a", // blue-900
      codeFoldGutterBackground: "#404040", // neutral-700
      codeFoldBackground: "#404040",
      emptyLineBackground: "#171717",
      gutterColor: "#a3a3a3", // neutral-400
      addedGutterColor: "#c7d2fe",
      removedGutterColor: "#bae6fd",
      codeFoldContentColor: "#a3a3a3",
      diffViewerTitleBackground: "#262626",
      diffViewerTitleColor: "#f5f5f5",
      diffViewerTitleBorderColor: "#404040",
    },
  },
  line: {
    wordBreak: "break-word" as const,
  },
};

function Flow(flow1: string, flow2: string) {
  return (
    <div>
      <ReactDiffViewer
        oldValue={flow1}
        newValue={flow2}
        splitView={true}
        showDiffOnly={false}
        useDarkTheme={true}
        hideLineNumbers={true}
        styles={diffViewerStyles}
      />
      <hr
        style={{
          height: "1px",
          color: "inherit",
          borderTopWidth: "5px",
        }}
      />
    </div>
  );
}

function isASCII(str: string) {
  return /^[\x00-\x7F]*$/.test(str);
}

const displayOptions = ["Plain", "Hex"];

// Derives the display mode for two given flows
const deriveDisplayMode = (
  firstFlow: FullFlow,
  secondFlow: FullFlow
): typeof displayOptions[number] => {
  if (firstFlow && secondFlow) {
    for (
      let i = 0;
      i < Math.min(firstFlow.flow.length, secondFlow.flow.length);
      i++
    ) {
      if (
        !isASCII(firstFlow.flow[0].flow[i].data) ||
        !isASCII(secondFlow.flow[0].flow[i].data)
      ) {
        return displayOptions[1];
      }
    }
  }

  return displayOptions[0];
};

export function DiffView() {
  let [searchParams] = useSearchParams();
  const firstFlowParam = searchParams.get(FIRST_DIFF_KEY);
  const firstFlowId = firstFlowParam?.split(":")[0];
  const firstFlowRepr = parseInt(firstFlowParam?.split(":")[1] ?? "0");
  const secondFlowParam = searchParams.get(SECOND_DIFF_KEY);
  const secondFlowId = secondFlowParam?.split(":")[0];
  const secondFlowRepr = parseInt(secondFlowParam?.split(":")[1] ?? "0");

  let { data: firstFlow, isLoading: firstFlowLoading, isError: firstFlowError } = useGetFlowQuery(
    firstFlowId!,
    {
      skip: firstFlowId === null,
    }
  );
  let { data: secondFlow, isLoading: secondFlowLoading, isError: secondFlowError } = useGetFlowQuery(
    secondFlowId!,
    {
      skip: secondFlowId === null,
    }
  );

  const [displayOption, setDisplayOption] = useState(
    deriveDisplayMode(firstFlow!, secondFlow!)
  );

  if (firstFlowError || secondFlowError) {
    return <div>Invalid flow id</div>;
  }

  if (firstFlowLoading || secondFlowLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="sticky shadow-md bg-neutral-800 border-neutral-700 overflow-auto py-1 border-y flex items-center">
        <RadioGroup
          options={displayOptions}
          value={displayOption}
          onChange={setDisplayOption}
          className="flex gap-2 text-neutral-200 text-sm mr-4"
        />
      </div>

      {/* Plain */}
      {displayOption === displayOptions[0] && (
        <div>
          {Array.from(
            {
              length: Math.min(firstFlow!.flow[firstFlowRepr].flow.length, secondFlow!.flow[secondFlowRepr].flow.length),
            },
            (_, i) => Flow(firstFlow!.flow[firstFlowRepr].flow[i].data, secondFlow!.flow[secondFlowRepr].flow[i].data)
          )}
        </div>
      )}

      {/* Hex */}
      {displayOption === displayOptions[1] && (
        <div>
          {Array.from(
            {
              length: Math.min(firstFlow!.flow[firstFlowRepr].flow.length, secondFlow!.flow[secondFlowRepr].flow.length),
            },
            (_, i) =>
              Flow(
                hexy(Buffer.from(firstFlow!.flow[firstFlowRepr].flow[i].b64, 'base64'), { format: "twos" }),
                hexy(Buffer.from(secondFlow!.flow[secondFlowRepr].flow[i].b64, 'base64'), { format: "twos" })
              )
          )}
        </div>
      )}
    </div>
  );
}
