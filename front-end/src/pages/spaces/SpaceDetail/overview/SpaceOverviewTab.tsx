import { SpaceDetailImage } from "./SpaceDetailImage";
import { SpaceDetailInfo } from "./SpaceDetailInfo";
import { Space } from "@/services/spaces";

interface SpaceOverviewTabProps {
  space: Space;
}

export const SpaceOverviewTab = ({ space }: SpaceOverviewTabProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Space Image - Left Column */}
      <div className="w-full">
        <SpaceDetailImage space={space} />
      </div>

      {/* Space Details - Right Column */}
      <div className="w-full">
        <SpaceDetailInfo space={space} />
      </div>
    </div>
  );
};
