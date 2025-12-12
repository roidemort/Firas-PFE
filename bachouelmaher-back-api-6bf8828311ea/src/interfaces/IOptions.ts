export interface IOptions {
  orderBy?: string;
  select?: string;
  relations?: string;
  take?: number;
  page?: number;
}

export interface IQuery {
  take?: number;
  skip?: number;
  order?: {},
  select?: {},
  relations?: {},
  query?: { [p: string]: any },
}