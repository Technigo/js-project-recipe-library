### Week 7 task list 
- [x] Sign up for an account with the Spoonacular API.
- [x] Fetch real recipe data from Spoonacular's recipes/random endpoint
- [x] Display dynamic recipe cards based on the API data
- [x] Adapt filtering & sorting to match the API response format
- [x] Show a useful message to the user in case the daily quota has been reached
- [x] fix gluten free
- [x] fix empty state
- [x] deployed to netfy
- [x] fix spacing between ingredient lines, maybe smaller type?
- [x] fix random 


= = =

- @HIPPIEKICK requested changes on this pull request.

Good job with your recipe library! Overall you have chosen descriptive function names. Maybe the maxQuotaMessage could be named more “functiony”, e.g. displayMaxQuotaMessage, to indicate that it’s not a regular variable but a function that does something?

Remember to always stick to const as much as you can. Basically you only need to use let if you bump into issues. And remove console.logs. Just a thought about the quota. What would happen if they change the API slightly (i.e. they change the message). Is there a way to handle this error more generic/defensively?

if (data.status === "failed" && data.message.includes("You have reached your daily quota")) { // message
maxQuotaMessage(); return;
}
You can remove the conversation card if you don’t reeeeally really want to keep it 😇 Although, I see now that it kind of works as an error-text box as well so I guess it’s all good!

However, I think if no filters are matching you should update the DOM and don’t show any recipes.

PS. I think your card grid would look really good centered.

Changes requested

If no filters are matching you should update the DOM and don’t show any recipes.
