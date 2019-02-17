import gql from "graphql-tag";
import { GraphQLClient } from "graphql-request";

const API_URL = process.env.API_URL || "";
const ROOT_TOKEN = process.env.ROOT_TOKEN || "";

const graphQLClient: any = new GraphQLClient(API_URL, {
  headers: {
    authorization: `Bearer ${ROOT_TOKEN}`
  }
});

const INVITE_ACCEPT_FRAGMENT = gql`
  fragment InviteAcceptFragment on CustomInvite {
    id
    uuid
    email
    status
    acceptedAt
  }
`;

const CUSTOM_INVITE_BY_UUID = gql`
  query CustomInviteByUuid($uuid: String!){
    customInvite(uuid: $uuid) {
      ...InviteAcceptFragment
      roles {
        items {
          id
        }
      }
      company {
        id
      }
    }
  }

  ${INVITE_ACCEPT_FRAGMENT}
`;

const USER_BY_EMAIL = gql`
  query UserByEmail($email: String!){
    user(email: $email) {
      id
    }
  }
`;

const ACCEPT_INVITE_MUTATION = gql`
  mutation AcceptInvite($inviteUuid: String!, $acceptedAt: DateTime!, $userId: ID!, $companyId: ID!, $roles: [RoleKeyFilter!]) {
    customInviteUpdate(filter: {
      uuid: $inviteUuid
    }, data: {
      status: "Accepted"
      acceptedAt: $acceptedAt
    }) {
      ...InviteAcceptFragment
    }
    
    userUpdate(filter: {
      id: $userId
    }, data: {
      memberships: {
        create: {
          company: {
            connect: {
              id: $companyId
            }
          }
          roles: {
            connect: $roles
          }
        }
      }
    }) {
      id
    }
  }
  ${INVITE_ACCEPT_FRAGMENT}
`;



export default async (event: any, context: any) => {
  const { data: { uuid } } = event;

  const { customInvite: customInvite } = await graphQLClient.request(CUSTOM_INVITE_BY_UUID, { uuid });
  // TODO: remove this after update by any unique field on User is implemented
  const { user } = await graphQLClient.request(USER_BY_EMAIL, { email: customInvite.email });

  if (customInvite.status === "Accepted") {
    throw new Error("Invitation is already accepted.")
  }  

  const { customInviteUpdate: customInviteUpdate } = await graphQLClient.request(ACCEPT_INVITE_MUTATION,
    {
      inviteUuid: uuid,
      acceptedAt: (new Date()).toISOString(),
      userId: user.id,
      companyId: customInvite.company.id,
      roles: customInvite.roles.items
    });

  return {
    data: {
      ...customInviteUpdate
    }
  };
};
