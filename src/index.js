import { eq } from 'drizzle-orm';
import { db, pool } from './db/db.js';
import { matches, commentary } from './db/schema.js';

async function main() {
  try {
    console.log('Performing CRUD operations for Sports Application...\n');

    // CREATE: Insert a new match
    const [newMatch] = await db
      .insert(matches)
      .values({
        sport: 'Football',
        homeTeam: 'Manchester United',
        awayTeam: 'Liverpool',
        startTime: new Date(),
        status: 'live',
      })
      .returning();

    if (!newMatch) {
      throw new Error('Failed to create match');
    }

    console.log('✅ CREATE (Match): New match created:', newMatch);

    // CREATE: Insert commentary for the match
    const [newCommentary] = await db
      .insert(commentary)
      .values({
        matchId: newMatch.id,
        minute: 45,
        sequence: 1,
        period: 'First Half',
        eventType: 'goal',
        actor: 'Bruno Fernandes',
        team: 'Manchester United',
        message: 'Goal! Manchester United scores!',
        metadata: { goalType: 'open play', videoUrl: 'http://example.com/goal' },
        tags: ['goal', 'exciting', 'home-team'],
      })
      .returning();

    if (!newCommentary) {
      throw new Error('Failed to create commentary');
    }

    console.log('✅ CREATE (Commentary): New commentary created:', newCommentary);

    // READ: Select the match
    const foundMatch = await db
      .select()
      .from(matches)
      .where(eq(matches.id, newMatch.id));

    console.log('✅ READ (Match): Found match:', foundMatch[0]);

    // READ: Select commentary for the match
    const foundCommentary = await db
      .select()
      .from(commentary)
      .where(eq(commentary.matchId, newMatch.id));

    console.log('✅ READ (Commentary): Found commentary entries:', foundCommentary);

    // UPDATE: Change match score
    const [updatedMatch] = await db
      .update(matches)
      .set({ homeScore: 1, awayScore: 0, status: 'finished' })
      .where(eq(matches.id, newMatch.id))
      .returning();

    if (!updatedMatch) {
      throw new Error('Failed to update match');
    }

    console.log('✅ UPDATE (Match): Match updated:', updatedMatch);

    // UPDATE: Update commentary
    const [updatedCommentary] = await db
      .update(commentary)
      .set({ message: 'Goal! (Official confirmation)' })
      .where(eq(commentary.id, newCommentary.id))
      .returning();

    if (!updatedCommentary) {
      throw new Error('Failed to update commentary');
    }

    console.log('✅ UPDATE (Commentary): Commentary updated:', updatedCommentary);

    // DELETE: Remove the commentary
    await db.delete(commentary).where(eq(commentary.id, newCommentary.id));
    console.log('✅ DELETE (Commentary): Commentary deleted.');

    // DELETE: Remove the match
    await db.delete(matches).where(eq(matches.id, newMatch.id));
    console.log('✅ DELETE (Match): Match deleted.');

    console.log('\nCRUD operations completed successfully.');
  } catch (error) {
    console.error('❌ Error performing CRUD operations:', error);
    process.exit(1);
  } finally {
    // If the pool exists, end it to close the connection
    if (pool) {
      await pool.end();
      console.log('Database pool closed.');
    }
  }
}

main();
