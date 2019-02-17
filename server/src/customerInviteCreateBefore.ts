import {v4 as uuidv4} from 'uuid';

export default async (event: any, context: any) => {
  return {
    data: {
      ...event.data,
      uuid: uuidv4()
    }
  }
}