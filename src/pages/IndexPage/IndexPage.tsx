import { Section, Cell, Image, List, Button } from "@telegram-apps/telegram-ui";
import type { FC } from "react";
import { openLink } from "@tma.js/sdk-react";

import { Link } from "@/components/Link/Link.tsx";
import { Page } from "@/components/Page.tsx";

import tonSvg from "./ton.svg";

const mastermindText = `🎯 Mastermind
Attempts: 6
Time: 02:17

🟡 🔵 ⚪ 🔴
🟡 🟡 🔵 ⚪
🟢 🟢 🟢 🟢  ✓

Think you can beat this?
Play now: @MastermindBot`;

const handleShare = () => {
  const shareUrl = `tg://msg_url?url=${encodeURIComponent(mastermindText)}`;
  openLink(shareUrl);
};

export const IndexPage: FC = () => {
  return (
    <Page back={false}>
      <List>
        <Section
          header="Mastermind Game"
          footer="Share your amazing Mastermind game result with friends!"
        >
          <Cell
            subtitle="Share this game result in any chat"
            after={
              <Button mode="filled" size="s" onClick={handleShare}>
                Share
              </Button>
            }
          >
            🎯 Mastermind Challenge
          </Cell>
        </Section>
        <Section
          header="Features"
          footer="You can use these pages to learn more about features, provided by Telegram Mini Apps and other useful projects"
        >
          <Link to="/ton-connect">
            <Cell
              before={
                <Image src={tonSvg} style={{ backgroundColor: "#007AFF" }} />
              }
              subtitle="Connect your TON wallet"
            >
              TON Connect
            </Cell>
          </Link>
        </Section>
        <Section
          header="Application Launch Data"
          footer="These pages help developer to learn more about current launch information"
        >
          <Link to="/init-data">
            <Cell subtitle="User data, chat information, technical data">
              Init Data
            </Cell>
          </Link>
          <Link to="/launch-params">
            <Cell subtitle="Platform identifier, Mini Apps version, etc.">
              Launch Parameters
            </Cell>
          </Link>
          <Link to="/theme-params">
            <Cell subtitle="Telegram application palette information">
              Theme Parameters
            </Cell>
          </Link>
        </Section>
      </List>
    </Page>
  );
};
