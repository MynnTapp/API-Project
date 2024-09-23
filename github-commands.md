# Common Git Commands

```
git branch
```
- Lists the branches of your repo. The one with an asterisk `(*)` is your current branch.

```
git checkout <your-branch-name>

// for example
git checkout feature-branch
```
- Takes you to the branch `<your-branch-name>`.

```
git checkout -b <your-branch-name>

// for example
git checkout -b dev
```
- Creates a new branch with `<your-branch-name>` as its name and takes you to that branch.

```
- git status
```
- Shows current state of your working directory and staging area.

## How to Finish

After you're done with the feature, make sure to stage your changes and commit them:
```
git add .
git commit -m "Implement new feature description"
```

If you want to push your new feature branch to GitHub:
```
git push origin <new-branch-name>
```

Once the feature is done and tested, you'll need to merge it into the `dev` branch:

- First, switch back to the `dev` branch:
```
git checkout dev
```
- Then, pull the latest changes from `dev` to make sure you're up to date:
```
git pull origin dev
```
- Now, merge the new feature branch into `dev`:
```
git merge <new-branch-name>
```

Resolve any merge conflicts. After you've resolved them, commit the resolutions:
```
git add <resolved-file>
git commit -m "Resolve merge conflicts"
```

Push the updated `dev` branch to GitHub:
```
git push origin dev
```