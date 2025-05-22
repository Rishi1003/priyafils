@echo off
echo Pulling latest code...
git pull

echo.
echo Running Prisma migrations...
npx prisma migrate deploy

echo.
echo Generating Prisma client (optional)...
npx prisma generate

echo.
echo Done. Press any key to exit.
pause
