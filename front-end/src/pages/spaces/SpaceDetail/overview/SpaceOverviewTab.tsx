import { SpaceDetailImage } from "./SpaceDetailImage";
import { SpaceDetailInfo } from "./SpaceDetailInfo";
import { Space } from "../../../../services/spaces";

interface SpaceOverviewTabProps {
  space: Space;
}

export const SpaceOverviewTab = ({ space }: SpaceOverviewTabProps) => {
  return (
    <div className="space-y-6">
      {/* Space Image */}
      <SpaceDetailImage space={space} />

      {/* Space Details */}
      <SpaceDetailInfo space={space} />
    </div>
  );
};
