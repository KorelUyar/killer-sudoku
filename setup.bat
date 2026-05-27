@echo off
setlocal

echo Installing npm dependencies...
call npm install --no-audit --no-fund || goto :fail

if not exist .env (
  echo Creating .env from .env.example...
  copy .env.example .env >nul
)

echo Applying sudoku.sql to MySQL...
echo You'll be prompted for the MySQL root password.
mysql -u root -p < sudoku.sql || goto :fail

echo Generating Prisma client + pushing schema...
call npx prisma generate || goto :fail
call npx prisma db push --skip-generate || goto :fail

echo Seeding database...
call npx tsx seed.ts || goto :fail

echo.
echo SUCCESS: Setup complete.
echo Next steps:
echo   npm run dev    -^> http://localhost:3000
echo   npm test       -^> run unit tests
echo.
echo Default login: admin / Admin1234
goto :end

:fail
echo.
echo SETUP FAILED. Check the error above.
exit /b 1

:end
endlocal
