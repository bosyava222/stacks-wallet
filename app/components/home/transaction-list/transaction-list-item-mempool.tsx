import React, { FC, useRef, RefObject, useEffect, MutableRefObject } from 'react';
import { useHover, useFocus } from 'use-events';
import { Box, Flex, Stack, Text } from '@blockstack/ui';
import { MempoolTransaction } from '@blockstack/stacks-blockchain-api-types';
import { TransactionIcon } from './transaction-icon';
import { TransactionListItemContainer } from './transaction-list-item-container';
import { toHumanReadableStx } from '@utils/unit-convert';
import { sumStxTxTotal } from '@utils/sum-stx-tx-total';
import { truncateMiddle } from '@utils/tx-utils';
import { getTxTypeName } from '@stacks/ui-utils';

interface TransactionListItemMempoolProps {
  tx: MempoolTransaction;
  address: string;
  domNodeMapRef: MutableRefObject<any>;
  activeTxIdRef: MutableRefObject<string | null>;
  onSelectTx: (txId: string) => void;
}

export const TransactionListItemMempool: FC<TransactionListItemMempoolProps> = props => {
  const { tx, address, domNodeMapRef, activeTxIdRef, onSelectTx } = props;
  const [hovered, bindHover] = useHover();
  const [focused, bindFocus] = useFocus();
  const containerRef = useRef<HTMLButtonElement>(null);
  const memo =
    tx.tx_type === 'token_transfer' &&
    Buffer.from(
      tx.token_transfer.memo.replace('0x', '').replace(/^(0{2})+|(0{2})+$/g, ''),
      'hex'
    ).toString('utf8');

  useEffect(() => {
    if (containerRef.current !== null && domNodeMapRef !== null) {
      domNodeMapRef.current[tx.tx_id] = containerRef.current;
    }
  }, [domNodeMapRef, tx.tx_id]);

  if (focused && activeTxIdRef !== null) {
    activeTxIdRef.current = tx.tx_id;
  }

  const isSender = tx.sender_address === address;

  const isStackingTx =
    tx.tx_type === 'contract_call' && tx.contract_call.function_name === 'stack-stx';

  if (
    tx.tx_type === 'smart_contract' ||
    tx.tx_type === 'coinbase' ||
    tx.tx_type === 'poison_microblock' ||
    (tx.tx_type === 'contract_call' && !isStackingTx)
  )
    return null;

  const txDate = new Date(tx.receipt_time_iso);
  const txDateShort = txDate.toLocaleString();

  return (
    <TransactionListItemContainer
      ref={(containerRef as unknown) as RefObject<HTMLDivElement>}
      onClick={() => onSelectTx(tx.tx_id)}
      data-txid={tx.tx_id}
      focused={focused}
      hovered={hovered}
      txId={tx.tx_id}
      {...bindHover}
      {...bindFocus}
    >
      <TransactionIcon variant="pending" mr="base-loose" />
      <Box flex={1}>
        <Text textStyle="body.large.medium" display="block">
          {isStackingTx ? 'Stacking initiated' : isSender ? 'Sent' : 'Received'}
        </Text>
        <Stack isInline spacing="tight">
          <Text textStyle="body.small" color="ink.600">
            {getTxTypeName(tx as any)}
          </Text>
          <Text textStyle="body.small" color="ink.600">
            {txDateShort}
          </Text>
          <Text textStyle="body.small" color="ink.600">
            {tx.tx_type === 'token_transfer'
              ? isSender
                ? `To ${truncateMiddle(tx.token_transfer.recipient_address)}`
                : `From ${truncateMiddle(tx.sender_address)}`
              : null}
          </Text>
        </Stack>
      </Box>
      <Box textAlign="right">
        <Flex alignItems="center">
          <Text color="feedback.warning" fontSize={0} mr="tight" fontWeight="500">
            Pending
          </Text>
          <Text textStyle="body.large" color="ink.900" display="block">
            {isSender ? '-' : ''}
            {toHumanReadableStx(sumStxTxTotal(address, tx as any).toString())}
          </Text>
        </Flex>
        <Text textStyle="body.small" color="ink.600">
          {memo}
        </Text>
      </Box>
    </TransactionListItemContainer>
  );
};
