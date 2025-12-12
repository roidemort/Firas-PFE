
export interface Image {
  id: string;
  filename: string;
  secure_url: number;
  public_id: string;
  size: number;
  height: number;
  width: number;
  format: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  selected?: boolean;
}
