import HomeClientWrapper from "./HomeClientWrapper";
import MarketingHome from "./MarketingHome";

export default async function Home() {
  return (
    <HomeClientWrapper>
      <MarketingHome />
    </HomeClientWrapper>
  );
}
