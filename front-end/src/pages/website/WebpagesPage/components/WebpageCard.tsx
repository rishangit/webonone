import { WebpageCardProps } from "../types";
import { WebpageCardView } from "./WebpageCardView";
import { WebpageListView } from "./WebpageListView";

export const WebpageCard = ({
  webPage,
  viewMode,
  onEdit,
  onBrowse,
  onDelete,
}: WebpageCardProps) => {
  if (viewMode === "grid") {
    return (
      <WebpageCardView
        webPage={webPage}
        onEdit={onEdit}
        onBrowse={onBrowse}
        onDelete={onDelete}
      />
    );
  }
  return (
    <WebpageListView
      webPage={webPage}
      onEdit={onEdit}
      onBrowse={onBrowse}
      onDelete={onDelete}
    />
  );
};
