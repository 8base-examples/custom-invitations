export default async (event: any, context: any) => {
  const { data } = event;
  // Integrate with SendGrid here to send a email
  console.log(`Sending invite email with uuid ${data.uuid}`);

  return {
    data: {
      ...event.data
    }
  }
}