# Intro
This repo demonstrates the implementation of custom user invites in multi-tenant apps built on 8base. In this scenario we have `Company` table and each user is invited into specific company with predefined roles. When an invite is accepted a new `Memership` record is created to link `User` with `Company` and assign roles for that membership.

# Setting up the workspace
1. Create an empty workspace
2. Run the script below
```
cd server
8base login
8base import -f SCHEMA.json
npm install
8base deploy
```
3. Create `System` role, give permissions to all tables
4. Create an API token with `System` role
5. Create two environment variables: 
* `API_URL` (workspace API endpoint), 
* `ROOT_TOKEN`  (token created in step 4)

# Step-by-step workflow
1. Alice is a user in Company A. She invites Bob to join Company A as manager by creating new `Custom Invite` object. This object contains email of the invitee, assigned roles (manager), link to the Company A record.
2. In the trigger after `customInviteCreate` we can send an email invitation to Bob using SendGrid or other provider. The email contains a link pointing to a secured route on the front-end.
3. Bob clicks the link, completes regular signup process.
4. After signup redirects back to the front-end we query whether Bob has invites based on his email address.
5. If query returns an invite, we prompt Bob to accept it by calling custom `acceptInvite` resolver. This automatically creates a membership for Bob in Company A.


# Custom functions
* customerInviteCreateBefore. Allows to auto-generate `uuid` - a universally unique ID for our invite.
* customerInviteCreateAfter. Here we can send an email with invite accept link.
* acceptInvite. Custom resolver that encapsulates all the logic that goes into accepting an invite: creating `Membership` record for the user, transitioning status of the invite to `Accepted`.

# TODO
* Front-end example
