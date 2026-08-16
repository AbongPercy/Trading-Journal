import { CreateTradeDto } from './create-trade.dto';

/**
 * Fields used when editing an existing trade. Same rules as creating,
 * and it is a full replace of the editable fields.
 *
 * Result fields (pnlAmount, resultNote, status, resultLocked) are never
 * touched here - those are managed by the close flow.
 */
export class UpdateTradeDto extends CreateTradeDto {}
