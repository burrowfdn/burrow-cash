import { useEffect, useState } from "react";
import { BeatLoader } from "react-spinners";
import { twMerge } from "tailwind-merge";
import { Link, Stack, Typography } from "@mui/material";
import SemiCircleProgressBar from "../../components/SemiCircleProgressBar/SemiCircleProgressBar";
import { useUserHealth } from "../../hooks/useUserHealth";
import { formatUSDValue, isMobileDevice } from "../../helpers/helpers";
import CustomButton from "../../components/CustomButton/CustomButton";
import { APY_FORMAT, COMPACT_USD_FORMAT, m, USD_FORMAT } from "../../store";
import { useRewards } from "../../hooks/useRewards";
import ClaimAllRewards from "../../components/ClaimAllRewards";
import ModalHistoryInfo from "./modalHistoryInfo";
import { modalProps } from "../../interfaces/common";
import { DangerIcon, QuestionIcon, RecordsIcon } from "../../components/Icons/Icons";
import CustomTooltips from "../../components/CustomTooltips/CustomTooltips";
import { useAccountId, useNonFarmedAssets, useUnreadLiquidation } from "../../hooks/hooks";
import { ProtocolDailyRewards, UserDailyRewards } from "../../components/Header/stats/rewards";
import { UserLiquidity } from "../../components/Header/stats/liquidity";
import { APY } from "../../components/Header/stats/apy";

const DashboardOverview = ({ suppliedRows, borrowedRows }) => {
  const [modal, setModal] = useState<modalProps>({
    name: "",
    data: null,
  });
  const userHealth = useUserHealth();
  const rewardsObj = useRewards();
  const { unreadLiquidation, fetchUnreadLiquidation } = useUnreadLiquidation();
  const isMobile = isMobileDevice();

  useEffect(() => {
    fetchUnreadLiquidation().then();
  }, []);

  let totalSuppliedUSD = 0;
  suppliedRows?.forEach((d) => {
    const usd = Number(d.supplied) * Number(d.price);
    totalSuppliedUSD += usd;
  });

  let totalBorrowedUSD = 0;
  borrowedRows?.forEach((d) => {
    const usd = Number(d.borrowed) * Number(d.price);
    totalBorrowedUSD += usd;
  });

  const handleModalOpen = (modalName: string, modalData?: object) => {
    setModal({ name: modalName, data: modalData });
  };

  const handleModalClose = () => {
    setModal({
      name: "",
      data: null,
    });
  };

  return (
    <div className="lg:flex md:justify-between lg:justify-between">
      <div className="mb-4 md:mb-0">
        <div className="flex gap-2 md:gap-6 lg:gap-8">
          <div className="gap-6 flex flex-col">
            <UserLiquidity />
            <UserDailyRewards />
          </div>

          <div className="gap-6 flex flex-col">
            <APY />
            <div className="flex flex-col">
              {/* <OverviewItem */}
              {/*  title="Unclaimed Rewards" */}
              {/*  value={rewardsObj?.data?.totalUnClaimUSDDisplay || "$0"} */}
              {/* /> */}
              <div className="h6 text-gray-300">Unclaimed Rewards</div>
              <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                <div className="flex items-center gap-4 my-1">
                  <div className="h2">{rewardsObj?.data?.totalUnClaimUSDDisplay || "$0"}</div>
                  <div className="flex" style={{ marginRight: 20 }}>
                    {rewardsObj?.brrr?.icon ? (
                      <img
                        src={rewardsObj?.brrr?.icon}
                        width={26}
                        height={26}
                        alt="token"
                        className="rounded-full"
                        style={{ margin: -3 }}
                      />
                    ) : null}

                    {rewardsObj?.extra?.length
                      ? rewardsObj.extra.map((d, i) => {
                          const extraData = d?.[1];
                          return (
                            <img
                              src={extraData?.icon}
                              width={26}
                              key={(extraData?.tokenId || "0") + i}
                              height={26}
                              alt="token"
                              className="rounded-full"
                              style={{ margin: -3 }}
                            />
                          );
                        })
                      : null}
                  </div>
                </div>

                {rewardsObj?.data?.totalUnClaimUSD > 0 && (
                  <div style={{ marginBottom: 4 }}>
                    <ClaimAllRewards Button={ClaimButton} location="dashboard" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between lg:ml-10">
        <div className="flex items-center gap-2">
          <CustomButton
            onClick={() => handleModalOpen("history", { tabIndex: 1 })}
            className="relative"
            color={unreadLiquidation?.count ? "secondary2" : "secondary"}
            size={isMobile ? "sm" : "md"}
          >
            {unreadLiquidation?.count ? (
              <span
                className="unread-count absolute rounded-full bg-pink-400 text-black"
                style={{ top: -8, right: -8 }}
              >
                {unreadLiquidation.count}
              </span>
            ) : null}
            Liquidation
          </CustomButton>
          <div
            className="cursor-pointer"
            onClick={() => handleModalOpen("history", { tabIndex: 0 })}
          >
            <RecordsIcon />
          </div>
        </div>

        <div className="relative mr-6">
          <HealthFactor userHealth={userHealth} />
        </div>
      </div>

      <ModalHistoryInfo
        isOpen={modal?.name === "history"}
        onClose={handleModalClose}
        tab={modal?.data?.tabIndex}
      />
    </div>
  );
};

const HealthFactor = ({ userHealth }) => {
  const { data, healthFactor, lowHealthFactor, dangerHealthFactor } = userHealth || {};
  const isDanger = healthFactor !== -1 && healthFactor < dangerHealthFactor;
  const isWarning = healthFactor !== -1 && healthFactor < lowHealthFactor;
  const isMobile = isMobileDevice();

  let dangerTooltipStyles = {};
  let tooltipStyles = {};
  if (isMobile) {
    tooltipStyles = {
      left: -133,
    };
    dangerTooltipStyles = {
      left: "100%",
      bottom: 0,
    };
  }

  return (
    <SemiCircleProgressBar
      value={healthFactor}
      dividerValue={100}
      dividerPercent={75}
      isWarning={isWarning}
    >
      <div className="absolute">
        <div
          className={twMerge(
            "h2b text-primary",
            isWarning && "text-warning",
            isDanger && "text-red-100 flex gap-2 items-center",
          )}
        >
          {isDanger && (
            <CustomTooltips
              alwaysShow={!isMobile}
              style={dangerTooltipStyles}
              text={`Your health factor is dangerously low and you're at risk of liquidation`}
              width={186}
            >
              <DangerIcon />
            </CustomTooltips>
          )}
          {data?.valueLabel}
        </div>
        <div className="h5 text-gray-300 flex gap-1 items-center justify-center">
          Health Factor
          <div style={{ marginRight: -5 }} className="relative">
            <CustomTooltips
              style={tooltipStyles}
              text={`Represents the combined collateral ratios of the borrowed assets. If it is less than ${dangerHealthFactor}%, your account can be partially liquidated`}
            >
              <QuestionIcon />
            </CustomTooltips>
          </div>
        </div>
      </div>
    </SemiCircleProgressBar>
  );
};

type OverviewItemProps = {
  title: string;
  value?: any;
  labels?: any;
};
const OverviewItem = ({ title, value, labels }: OverviewItemProps) => {
  return (
    <div>
      <div className="h6 text-gray-300">{title}</div>
      <div className="h2">{value}</div>
      {labels?.map((row, i) => (
        <div className="flex gap-2" key={i}>
          {row?.map((d) => (
            <div
              key={d.text}
              className="flex items-center gap-2 h5 rounded-[21px] bg-dark-100"
              style={{ padding: "1px 8px" }}
            >
              <div style={d.textStyle}>{d.text}</div>
              <div style={d.valueStyle}>{d.value}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const ClaimButton = (props) => {
  const { loading, disabled } = props;
  return (
    <div
      {...props}
      className="flex items-center justify-center bg-primary rounded-md cursor-pointer text-sm font-bold text-dark-200 hover:opacity-80 w-20 h-8"
    >
      {loading ? <BeatLoader size={5} color="#14162B" /> : <>Claim</>}
    </div>
  );
};

export default DashboardOverview;
