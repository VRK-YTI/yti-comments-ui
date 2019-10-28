import { CommentThreadResultType } from '../services/api-schema';

export class CommentThreadResult {

  status: string;
  count: number;
  percentage: string;

  constructor(data: CommentThreadResultType) {

    this.status = data.status;
    this.count = data.count;
    this.percentage = data.percentage;
  }

  serialize(): CommentThreadResultType {

    return {
      status: this.status,
      count: this.count,
      percentage: this.percentage
    };
  }
}
